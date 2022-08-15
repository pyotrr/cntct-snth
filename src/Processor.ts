// @ts-ignore
export class Processor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputList: any, outputList: any, parameters: any) {
    console.log(inputList, outputList);
    const input = inputList[0];
    const output = outputList[0];
    const channelCount = Math.min(input.length, output.length);

    for (let channelNum = 0; channelNum < channelCount; channelNum++) {
      input[channelNum].forEach((sample: number, i: number) => {
        output[channelNum][i] = sample;
      });
    }

    return true;
  }
}

// @ts-ignore
registerProcessor("processor", Processor);
