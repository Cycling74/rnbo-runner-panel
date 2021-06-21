import { useContext } from "react";
import Overlay from "./Overlay";
import Parameter from "./Parameter";
import { DeviceContext } from "../contexts/device";
import { ParameterRecord } from "../models/parameter";
import { OrderedMap } from "immutable";
import styles from "../../styles/Device.module.css"
import Midi from "./Midi";

export default function Device() {

	const {connectionState, device, setParameterValueNormalized, triggerMidiNoteEvent} = useContext(DeviceContext);

	const connectionString = connectionState !== WebSocket.OPEN ? "Not connected" : "Connected";

	const parameters = !device ? OrderedMap<string, ParameterRecord>() : device.parameters.map(parameter => {
		const onSetValue = (value: number) => {
			setParameterValueNormalized(parameter.name, value);
		};
		return <Parameter key={parameter.name} record={parameter} onSetValue={onSetValue} />
	});

	return (
		<>
			<Overlay status={connectionString}/>
			<div className={styles.container}>
				<div className={styles.grid}>
					{parameters.valueSeq()}
				</div>
			</div>
			<Midi onNoteOn={p => triggerMidiNoteEvent(p, true)} onNoteOff={p => triggerMidiNoteEvent(p, false)}/>
		</>
	)
}
