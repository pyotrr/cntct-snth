import { createSignal, onMount, Show } from "solid-js";
import DevicesList from "./components/DevicesList";
import processorWorkletUrl from "./assets/Processor.ts?url";

import styles from "./components/DevicesList/DevicesList.module.css";

const AUDIO_INPUT_IDENTIFIER = "audioinput" as const;
let audioCtx: AudioContext;
let audioNode;
let workletNode: AudioWorkletNode;

const App = () => {
  const [hasMicPermission, setHasMicPermission] = createSignal<boolean>();
  const [audioInputDevices, setAudioInputDevices] =
    createSignal<InputDeviceInfo[]>();
  const [isReadingFromMic, setIsReadingFromMic] = createSignal(false);

  onMount(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setHasMicPermission(true);
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          setAudioInputDevices(
            devices.filter((device) => {
              return device.kind === AUDIO_INPUT_IDENTIFIER;
            })
          );
        });
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      })
      .catch(() => {
        setHasMicPermission(false);
      });
  });

  const onInputDeviceSelect = async (deviceId: string) => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
      await audioCtx.audioWorklet.addModule(processorWorkletUrl);
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, deviceId: deviceId },
    });
    audioNode = audioCtx.createMediaStreamSource(stream);
    console.log(audioCtx.sampleRate);
    workletNode = new AudioWorkletNode(audioCtx, "processor", {
      processorOptions: { sampleRate: audioCtx.sampleRate },
    });
    audioNode.connect(workletNode).connect(audioCtx.destination);
    setIsReadingFromMic(true);
    console.log(workletNode);
  };

  return (
    <div>
      <Show
        when={hasMicPermission() !== false}
        fallback={<div>please give permissions</div>}
      >
        <Show when={Boolean(audioInputDevices())} fallback={"loading"}>
          <DevicesList
            devices={audioInputDevices() || []}
            onInputDeviceSelect={onInputDeviceSelect}
          />
          <Show when={isReadingFromMic()}>
            <button
              type={"button"}
              class={styles.deviceItem}
              onClick={() => {
                workletNode.port.postMessage("stop");
              }}
            >
              Stop
            </button>
          </Show>
        </Show>
      </Show>
    </div>
  );
};

export default App;
