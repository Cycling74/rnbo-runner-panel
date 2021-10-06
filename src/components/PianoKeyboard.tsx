import { memo, useCallback } from "react";
import { MidiNumbers } from "react-piano";
import { DimensionsProvider } from "../contexts/dimension";
import ResponsivePiano from "./ResponsivePiano";
import { triggerRemoteMidiNoteEvent } from "../actions/device";
import { useAppDispatch } from "../hooks/useAppDispatch";
import styled from "styled-components";

const MIDIWrapper = styled.div`
	height: 10rem;
	width: 80%;
	div {
		height: 100%;
	}
`;

const noteRange = {
	first: MidiNumbers.fromNote("c3"),
	last: MidiNumbers.fromNote("f4")
};

const PianoKeyboard = memo(function WrappedPianoKeyboard() {

	const dispatch = useAppDispatch();

	const onNoteOn = useCallback((p: number) => {
		dispatch(triggerRemoteMidiNoteEvent(p, true));
	}, [dispatch]);

	const onNoteOff = useCallback((p: number) => {
		dispatch(triggerRemoteMidiNoteEvent(p, true));
	}, [dispatch]);

	return  (
		<MIDIWrapper>
			<DimensionsProvider>
				<ResponsivePiano noteRange={noteRange} onNoteOn={onNoteOn} onNoteOff={onNoteOff}/>
			</DimensionsProvider>
		</MIDIWrapper>
	);
});

export default PianoKeyboard;
