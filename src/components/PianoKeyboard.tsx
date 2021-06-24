import { useContext, memo } from "react";
import { DeviceContext } from "../contexts/device";
import { MidiNumbers } from "react-piano";
import { DimensionsProvider } from "../contexts/dimension";
import ResponsivePiano from "./ResponsivePiano";
import styles from "../../styles/PianoKeyboard.module.css"

const noteRange = {
	first: MidiNumbers.fromNote('c3'),
	last: MidiNumbers.fromNote('f4'),
};

type PianoKeyboardProps = {
	triggerMidiNoteEvent: (p: number, isOn: boolean) => void;
};

const PianoKeyboard = memo(function WrappedPianoKeyboard({ triggerMidiNoteEvent }: PianoKeyboardProps) {

	const {device} = useContext(DeviceContext);

	const onNoteOn = (p) => triggerMidiNoteEvent(p, true);
	const onNoteOff = (p) => triggerMidiNoteEvent(p, false);

	return  (
		<div className={styles.keyboardContainer}>
			<DimensionsProvider>
				<ResponsivePiano noteRange={noteRange} onNoteOn={onNoteOn} onNoteOff={onNoteOff}/>
			</DimensionsProvider>
		</div>
	);
});

export default PianoKeyboard;
