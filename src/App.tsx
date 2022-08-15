import { createSignal, onMount, Show } from "solid-js";
import DevicesList from "./components/DevicesList";
import processorWorkletUrl from "./Processor.ts?url";

const AUDIO_INPUT_IDENTIFIER = "audioinput" as const;
let audioCtx: AudioContext;
let audioNode;

const App = () => {
  const [hasMicPermission, setHasMicPermission] = createSignal<boolean>();
  const [audioInputDevices, setAudioInputDevices] =
    createSignal<InputDeviceInfo[]>();

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
      console.log(audioCtx.audioWorklet);
      await audioCtx.audioWorklet.addModule(processorWorkletUrl);
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, deviceId: deviceId },
    });
    audioNode = audioCtx.createMediaStreamSource(stream);
    const audioWorkletNode = new AudioWorkletNode(audioCtx, "processor");
    audioNode.connect(audioWorkletNode);
    console.log(audioWorkletNode);
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
        </Show>
      </Show>
    </div>
  );
};

export default App;
