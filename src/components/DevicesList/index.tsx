import { Component, For } from "solid-js";

import styles from "./DevicesList.module.css";

interface IDevicesListProps {
  devices: InputDeviceInfo[];
  onInputDeviceSelect: (deviceId: string) => void;
}

const DevicesList: Component<IDevicesListProps> = (props) => {
  console.log(props.devices);

  return (
    <div class={styles.wrapper}>
      <For each={props.devices}>
        {(device) => {
          console.log(device);
          if (device.groupId === "default") {
            return (
              <button
                class={`${styles.deviceItem} ${styles.default}`}
                type={"button"}
                onClick={() => props.onInputDeviceSelect(device.deviceId)}
              >
                <p>{device.label}</p>
                <p>{"default"}</p>
              </button>
            );
          }
          return (
            <button
              class={styles.deviceItem}
              type={"button"}
              onClick={() => props.onInputDeviceSelect(device.deviceId)}
            >
              {device.label}
            </button>
          );
        }}
      </For>
    </div>
  );
};

export default DevicesList;
