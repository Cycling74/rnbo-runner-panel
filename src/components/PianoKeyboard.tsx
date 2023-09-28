import { FunctionComponent, memo, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { Set as ImmuSet } from "immutable";
import { useAppDispatch } from "../hooks/useAppDispatch";
import { triggerRemoteMidiNoteEvent } from "../actions/device";
import styled from "styled-components";
import { clamp } from "../lib/util";

const MIDIWrapper = styled.div`
	display: flex;
	justify-content: center;
	user-select: none;
	touch-action: none;
`;


const KeyWidth = 30;
const OctaveWidth = KeyWidth * 7;
const BaseOctave = 4;

interface NoteElementProps {
	index: number;
	isActive: boolean;
	isWhiteKey: boolean;
}

const NoteElement = styled.div.attrs<NoteElementProps>(({
	index,
	isWhiteKey
}) => ({
	style: {
		height: isWhiteKey ? "100%" : "60%",
		left: isWhiteKey ? index * KeyWidth : index * KeyWidth + 0.5 * KeyWidth,
		zIndex: isWhiteKey ? 2 : 3
	}
}))<NoteElementProps>`

	background-color: ${({ isActive, isWhiteKey, theme }) => isActive ? theme.colors.primary : isWhiteKey ? "#fff" : "#333" };
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
	border-color: gray;
	border-style: solid;
	border-width: 1px;
	position: absolute;
	top: 0;
	width: ${KeyWidth}px;
`;

const Note: FunctionComponent<{
	index: number;
	isActive: boolean;
	isWhiteKey: boolean;
	note: number;
	onNoteOn: (n: number) => any;
	onNoteOff: (n: number) => any;
}> = memo(({
	index,
	isActive,
	isWhiteKey,
	note,
	onNoteOff,
	onNoteOn
}) => {

	const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
		if (isActive) return;
		onNoteOn(note);
	};

	const onPointerEnter = (e: PointerEvent<HTMLDivElement>) => {
		if (e.pointerType === "mouse" && !e.buttons) return;
		onNoteOn(note);
	};

	const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
		if (!isActive) return;
		if (e.pointerType === "mouse" && !e.buttons) return;
		onNoteOff(note);
	};

	const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
		if (!isActive) return;
		onNoteOff(note);
	};

	return (
		<NoteElement
			className={ isActive ? "active" : "" }
			index={ index }
			isActive={ isActive }
			isWhiteKey={ isWhiteKey }
			onPointerEnter={ onPointerEnter }
			onPointerDown={ onPointerDown}
			onPointerLeave={ onPointerLeave }
			onPointerCancel={ onPointerUp }
			onPointerUp={ onPointerUp }
		/>
	);
});

Note.displayName = "Note";

const OctaveElement = styled.div`
	height: 150px;
	position: relative;
	user-select: none;
	width: ${OctaveWidth}px;

	&:not(:last-child) {
		border-right: none;
	}

	> div {
		height: 100%;
		left: 0;
		position: absolute;
		top: 0;
		width: 100%;
	}
`;

const Octave: FunctionComponent<{
	octave: number;
	activeNotes: ImmuSet<number>;
	onNoteOn: (note: number) => any;
	onNoteOff: (note: number) => any;
}> = memo(({
	octave,
	activeNotes,
	onNoteOn,
	onNoteOff
}) => {

	const start = 12 * octave;
	const whiteNotes: JSX.Element[] = [];
	const blackNotes: JSX.Element[] = [];

	for (let i = 0, key = start; i < 7; i++) {

		// create a white key for every entry
		whiteNotes.push(<Note
			key={ key }
			index={ i }
			note={ key }
			isActive={ activeNotes.has(key) }
			isWhiteKey={ true }
			onNoteOn={ onNoteOn }
			onNoteOff={ onNoteOff }
		/>);
		key++;

		// create black key?!
		if (i !== 2 && i !== 6) {
			blackNotes.push(
				<Note
					key={ key }
					index={ i }
					note={ key }
					isActive={ activeNotes.has(key) }
					isWhiteKey={ false }
					onNoteOn={ onNoteOn }
					onNoteOff={ onNoteOff }
				/>
			);
			key++;
		}
	}

	return (
		<OctaveElement>
			<div>
				{ blackNotes }
				{ whiteNotes }
			</div>
		</OctaveElement>
	);
});

Octave.displayName = "OctaveName";

export const PianoKeyboard: FunctionComponent<Record<string, never>> = memo(() => {

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
			setNoOfOctaves(clamp(Math.floor(width / OctaveWidth), 1, 6));
		};

		window.addEventListener("resize", onResize);
		onResize();

		return () => window.removeEventListener("resize", onResize);
	}, []);

	const octs: JSX.Element[] = [];

	for (let i = 0; i < noOfOctaves; i++) {
		octs.push(<Octave
			key={ i }
			octave={ BaseOctave + i }
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

PianoKeyboard.displayName = "PianoKeyboard";

export default PianoKeyboard;
