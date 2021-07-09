import { memo, useCallback } from "react";
import { MidiNumbers } from "react-piano";
import { DimensionsProvider } from "../contexts/dimension";
import ResponsivePiano from "./ResponsivePiano";
import styles from "../../styles/PianoKeyboard.module.css"
import { triggerRemoteMidiNoteEvent } from "../actions/device";
import { useAppDispatch } from "../hooks/useAppDispatch";

const noteRange = {
	first: MidiNumbers.fromNote('c3'),
	last: MidiNumbers.fromNote('f4'),
};

type PianoKeyboardProps = {};

const PianoKeyboard = memo(function WrappedPianoKeyboard({ } : PianoKeyboardProps) {

	const dispatch = useAppDispatch();

	const onNoteOn = useCallback((p: number) => {
		dispatch(triggerRemoteMidiNoteEvent(p, true));
	}, [dispatch]);

	const onNoteOff = useCallback((p: number) => {
		dispatch(triggerRemoteMidiNoteEvent(p, true));
	}, [dispatch]);

	return  (
		<div className={styles.keyboardContainer}>
			<DimensionsProvider>
				<ResponsivePiano noteRange={noteRange} onNoteOn={onNoteOn} onNoteOff={onNoteOff}/>
			</DimensionsProvider>
		</div>
	);
});

export default PianoKeyboard;
