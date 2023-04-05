const sine = (frequency: number, time: number) => {
  return Math.sin(2 * Math.PI * frequency * time);
};

// @ts-ignore
export class Processor extends AudioWorkletProcessor {
  shouldStop: boolean = false;
  sampleCounter: number = 0;
  secondsCounter: number = 0;
  sampleRate: number;
  isPlaying: boolean = false;
  frequencySet: number[] = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88];
  currentFreq: number = 261.63;

  constructor(options: {
    processorOptions: { frequencySet: number[]; sampleRate: number };
  }) {
    super();
    this.sampleRate = options.processorOptions.sampleRate;
    // @ts-ignore
    this.port.onmessage = (event: MessageEvent) => {
      if (event.data === "stop") {
        this.shouldStop = true;
        console.log("stopping");
      }
    };
  }

  getNormalizedBufferLoudness(samplesBuffer: Float32Array): number {
    const sum = samplesBuffer.reduce((acc, el) => acc + el, 0);
    return sum / -128;
  }

  getRandomFreq(): number {
    return this.frequencySet[
      Math.floor(Math.random() * this.frequencySet.length)
    ];
  }

  process(inputList: any, outputList: any, parameters: any) {
    const input = inputList[0];
    const output = outputList[0];
    // const channelCount = Math.min(input.length, output.length);

    const inputMono = input[0];

    console.log(this.getNormalizedBufferLoudness(inputMono));
    if (this.isPlaying) {
      console.log("processing...");
    }

    // console.log(this.getNormalizedBufferLoudness(inputMono), !this.isPlaying);
    if (this.getNormalizedBufferLoudness(inputMono) < 0.5 && !this.isPlaying) {
      return true;
    }
    if (this.isPlaying) {
      console.log("processing...");
    }

    if (!this.isPlaying) {
      this.currentFreq = this.getRandomFreq();
    }

    this.isPlaying = true;
    for (let i = 0; i < inputMono.length; i++) {
      const sinVal = sine(
        this.currentFreq,
        this.sampleCounter / this.sampleRate
      );
      output[0][i] = sinVal;
      output[1][i] = sinVal;
      this.sampleRate++;
      if (this.sampleCounter > this.sampleRate) {
        this.sampleCounter = 0;
        this.secondsCounter++;
      }
      if (this.secondsCounter === 2) {
        this.isPlaying = false;
      }
      if (this.secondsCounter > 2) {
        this.secondsCounter = 0;
      }
    }

    console.log(output);

    // for (let channelNum = 0; channelNum < channelCount; channelNum++) {
    //   input[channelNum].forEach((sample: number, i: number) => {
    //     outputList[0][channelNum][i] = sample;
    //   });
    // }

    return !this.shouldStop;
  }
}

// @ts-ignore
registerProcessor("processor", Processor);
