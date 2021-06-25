import { useContext, memo } from "react";
import Status from "./Status";
import ParameterList from "./ParameterList";
import { DeviceContext } from "../contexts/device";
import { ParameterRecord } from "../models/parameter";
import { OrderedMap } from "immutable";
import styles from "../../styles/Device.module.css";
import PianoKeyboard from "./PianoKeyboard";
import Ports from "./Ports";
import TwoColumns from "../containers/TwoColumns";
import TabbedContainer from "../containers/TabbedContainer";
import { useMediaQuery } from "react-responsive";

export default function Device() {

	const {connectionState, parameters, setParameterValueNormalized, triggerMidiNoteEvent, sendListToInport } = useContext(DeviceContext);

	const onSend = (name: string, textValue: string) => {
		const values = textValue.split(/\s+/).map(s => parseFloat(s));
		sendListToInport(name, values);
	};

	const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

	const paramContents = (
		<>
			<Status connectionState={connectionState}/>
			<div className={styles.paramContainer}>
				<ParameterList parameters={parameters} onSetValue={setParameterValueNormalized}></ParameterList>
			</div>
		</>
	);
	const inputContents = (
		<>
			<div className={styles.keyboardContainer}>
				<h2>MIDI Input</h2>
				<PianoKeyboard triggerMidiNoteEvent={triggerMidiNoteEvent} />
			</div>
			<div className={styles.portContainer}>
				<h2>Inports</h2>
				<Ports onSend={onSend}/>
			</div>
		</>
	);

	return (
		<>
			<div className={styles.wrapper}>
				{isTabletOrMobile ?
					<TabbedContainer firstTabContents={paramContents} secondTabContents={inputContents}></TabbedContainer> :
					<TwoColumns leftContents={paramContents} rightContents={inputContents}></TwoColumns>
				}
			</div>
		</>
	)
}
