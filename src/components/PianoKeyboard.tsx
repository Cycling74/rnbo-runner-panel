import { useContext } from "react";
import { DeviceContext } from "../contexts/device";
import { MidiNumbers } from "react-piano";
import { DimensionsProvider } from "../contexts/dimension";
import ResponsivePiano from "./ResponsivePiano";
import styles from "../../styles/PianoKeyboard.module.css"

const noteRange = {
	first: MidiNumbers.fromNote('c3'),
	last: MidiNumbers.fromNote('f4'),
  };

export default function PianoKeyboard({ onNoteOn, onNoteOff }) {

	const {device} = useContext(DeviceContext);

	return  (
		<div className={styles.keyboardContainer}>
			<DimensionsProvider>
				<ResponsivePiano noteRange={noteRange} onNoteOn={onNoteOn} onNoteOff={onNoteOff}/>
			</DimensionsProvider>
		</div>
	);
}
