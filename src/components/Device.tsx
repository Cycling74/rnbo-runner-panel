import { useContext } from "react";
import Status from "./Status";
import Parameter from "./Parameter";
import { DeviceContext } from "../contexts/device";
import { ParameterRecord } from "../models/parameter";
import { OrderedMap } from "immutable";
import styles from "../../styles/Device.module.css"
import PianoKeyboard from "./PianoKeyboard";
import Ports from "./Ports";

export default function Device() {

	const {connectionState, device, setParameterValueNormalized, triggerMidiNoteEvent, sendListToInport } = useContext(DeviceContext);

	const parameters = !device ? OrderedMap<string, ParameterRecord>() : device.parameters.map(parameter => {
		const onSetValue = (value: number) => {
			setParameterValueNormalized(parameter.name, value);
		};
		return <Parameter key={parameter.name} record={parameter} onSetValue={onSetValue} />
	});

	const onSend = (name: string, textValue: string) => {
		const values = textValue.split(/\s+/).map(s => parseFloat(s));
		sendListToInport(name, values);
	};

	return (
		<>

			<div className={styles.wrapper}>
				<div className={styles.container}>
					<div className={styles.leftContainer}>
						<Status connectionState={connectionState}/>
						<div className={styles.paramContainer}>
							<h2>Parameters</h2>
							<div className={styles.grid}>
								{parameters.valueSeq()}
							</div>
						</div>
					</div>
					<div className={styles.rightContainer}>
						<div className={styles.keyboardContainer}>
							<h2>MIDI Input</h2>
							<PianoKeyboard
								onNoteOn={p => triggerMidiNoteEvent(p, true)}
								onNoteOff={p => triggerMidiNoteEvent(p, false)}
							/>
						</div>
						<div className={styles.portContainer}>
							<h2>Inports</h2>
							<Ports onSend={onSend}/>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
