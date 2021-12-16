import { memo, useCallback } from "react";
import { MidiNumbers } from "react-piano";
import { DimensionsProvider } from "../contexts/dimension";
import ResponsivePiano from "./ResponsivePiano";
import { triggerRemoteMidiNoteEvent } from "../actions/device";
import { useAppDispatch } from "../hooks/useAppDispatch";
import styled from "styled-components";

const MIDIWrapper = styled.div`
	display: flex;
	justify-content: center;

	.keyboardContainer {
		height: 15rem;
		width: 80%;
	}

	.keyboardContainer > div {
		height: 100%;
	}

	@media screen and (max-width: 35.5em) {
		padding-top: 5rem;
		.keyboardContainer {
			height: 10rem;
			width: 100%;
		}
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
		dispatch(triggerRemoteMidiNoteEvent(p, false));
	}, [dispatch]);

	return  (
		<MIDIWrapper>
			<div className="keyboardContainer">
				<DimensionsProvider>
					<ResponsivePiano noteRange={noteRange} onNoteOn={onNoteOn} onNoteOff={onNoteOff} />
				</DimensionsProvider>
			</div>
		</MIDIWrapper>
	);
});

export default PianoKeyboard;
