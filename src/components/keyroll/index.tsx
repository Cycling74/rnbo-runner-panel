import { FunctionComponent, memo, useCallback, useEffect, useRef, useState } from "react";
import { Set as ImmuSet } from "immutable";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { triggerRemoteMidiNoteEvent } from "../../actions/device";
import styled from "styled-components";
import { clamp } from "../../lib/util";
import Octave, { octaveWidth } from "./octave";

const MIDIWrapper = styled.div`
	display: flex;
	justify-content: center;
	user-select: none;
	touch-action: none;
`;

const baseOctave = 4;

export const KeyRoll: FunctionComponent<Record<string, never>> = memo(() => {

	const dispatch = useAppDispatch();
	const containerRef = useRef<HTMLDivElement>();
	const [activeNotes, setActiveNotes] = useState(ImmuSet<number>());
	const [noOfOctaves, setNoOfOctaves] = useState(4);

	const onNoteOn = useCallback((p: number) => {
		dispatch(triggerRemoteMidiNoteEvent(p, true));
		setActiveNotes((notes: ImmuSet<number>) => notes.add(p));
	}, [dispatch]);

	const onNoteOff = useCallback((p: number) => {
		dispatch(triggerRemoteMidiNoteEvent(p, false));
		setActiveNotes((notes: ImmuSet<number>) => notes.delete(p));
	}, [dispatch]);

	useEffect(() => {
		const onResize = (ev?: UIEvent) => {
			if (!containerRef.current) return;
			const { width } = containerRef.current.getBoundingClientRect();
			setNoOfOctaves(clamp(Math.floor(width / octaveWidth), 1, 6));
		};

		window.addEventListener("resize", onResize);
		onResize();

		return () => window.removeEventListener("resize", onResize);
	}, []);

	const octs: JSX.Element[] = [];

	for (let i = 0; i < noOfOctaves; i++) {
		octs.push(<Octave
			key={ i }
			octave={ baseOctave + i }
			activeNotes={ activeNotes }
			onNoteOn={ onNoteOn }
			onNoteOff={ onNoteOff }
		/>);
	}

	return (
		<MIDIWrapper ref={ containerRef } >
			{ octs }
		</MIDIWrapper>
	);
});

KeyRoll.displayName = "KeyRoll";

export default KeyRoll;
