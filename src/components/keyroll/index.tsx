import { CSSProperties, FunctionComponent, memo, useCallback, useEffect, useState } from "react";
import { Set as ImmuSet } from "immutable";
import { clamp } from "../../lib/util";
import Octave from "./octave";
import classes from "./keyroll.module.css";
import { Breakpoints } from "../../lib/constants";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import { Orientation } from "../../lib/constants";
import { ActionIcon, Group } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

const baseOctave = 4;
const ignoredKeyboardTargets = new Set(["A", "INPUT", "TEXTAREA", "BUTTON"]);

const noteByKeyCode: Record<string, number> = {
	KeyA: 0,
	KeyW: 1,
	KeyS: 2,
	KeyE: 3,
	KeyD: 4,
	KeyF: 5,
	KeyT: 6,
	KeyG: 7,
	KeyY: 8,
	KeyH: 9,
	KeyU: 10,
	KeyJ: 11,
	KeyK: 12,
	KeyO: 13,
	KeyL: 14
};

export type KeyRollProps = {
	onTriggerNoteOn: (note: number) => any;
	onTriggerNoteOff: (note: number) => any;
	keyboardEnabled: boolean;
};

const calcOctaveCount = (size: number, minWidth: number): number => clamp(Math.floor(size / (minWidth * 7)), 1, 4);

export const KeyRoll: FunctionComponent<KeyRollProps> = memo(function WrappedKeyRoll({
	onTriggerNoteOn,
	onTriggerNoteOff,
	keyboardEnabled
}) {

	const [activeNotes, setActiveNotes] = useState(ImmuSet<number>());
	const [octave, setCurrentOctave] = useState<number>(baseOctave);

	const { ref, height: elementHeight, width: elementWidth } = useElementSize();
	const { width } = useViewportSize();

	const orientation = width >= Breakpoints.sm ? Orientation.Horizontal : Orientation.Vertical;
	let octaveCount = orientation === Orientation.Horizontal
		? calcOctaveCount(elementWidth, 45)
		: calcOctaveCount(elementHeight, 35);

	octaveCount = octave + octaveCount  > 9 ? 9 - octave : octaveCount;

	const onNoteOn = useCallback((p: number) => {
		if (p > 127) return;
		onTriggerNoteOn(p);
		setActiveNotes((notes: ImmuSet<number>) => notes.add(p));
	}, [onTriggerNoteOn]);

	const onNoteOff = useCallback((p: number) => {
		if (p > 127) return;
		onTriggerNoteOff(p);
		setActiveNotes((notes: ImmuSet<number>) => notes.delete(p));
	}, [onTriggerNoteOff]);

	const onIncrementOctave = useCallback(() => {
		setCurrentOctave(clamp(octave + 1, 1, 7));
		activeNotes.forEach((p) => onTriggerNoteOff(p));
		setActiveNotes(ImmuSet<number>());
	}, [activeNotes, octave, setCurrentOctave, setActiveNotes, onTriggerNoteOff]);

	const onDecrementOctave = useCallback(() => {
		setCurrentOctave(clamp(octave - 1, 1, 7));
		activeNotes.forEach((p) => onTriggerNoteOff(p));
		setActiveNotes(ImmuSet<number>());
	}, [activeNotes, octave, setCurrentOctave, setActiveNotes, onTriggerNoteOff]);

	const octs: JSX.Element[] = [];

	for (let i = 0; i < octaveCount; i++) {
		octs.push(<Octave
			key={ i }
			octave={ octave + i }
			activeNotes={ activeNotes }
			onNoteOn={ onNoteOn }
			onNoteOff={ onNoteOff }
		/>);
	}

	useEffect(() => {
		if (!keyboardEnabled) return () => {};

		const onKeyDown = (evt: KeyboardEvent): void => {
			if (evt.target instanceof HTMLElement && ignoredKeyboardTargets.has(evt.target.nodeName)) return;

			if (evt.code === "KeyZ") return void onDecrementOctave();
			if (evt.code === "KeyX") return void onIncrementOctave();

			const note = noteByKeyCode[evt.code];
			if (note === undefined) return;

			return void onNoteOn(octave * 12 + note);
		};

		const onKeyUp = (evt: KeyboardEvent): void => {
			if (evt.target instanceof HTMLElement && ignoredKeyboardTargets.has(evt.target.nodeName)) return;

			const note = noteByKeyCode[evt.code];
			if (note === undefined) return;

			return void onNoteOff(octave * 12 + note);
		};

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("keyup", onKeyUp);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("keyup", onKeyUp);
		};
	}, [keyboardEnabled, octave, onNoteOn, onNoteOff, onIncrementOctave, onDecrementOctave]);

	return (
		<div className={ classes.wrapper } >
			<Group justify="flex-end" gap="xs">
				<div className={ classes.octaveLabel } >C{octave}</div>
				<ActionIcon.Group>
					<ActionIcon variant="default" aria-label="Octave Down" onClick={ onDecrementOctave } >
						<FontAwesomeIcon icon={ faChevronDown } />
					</ActionIcon>
					<ActionIcon variant="default" aria-label="Octave Up" onClick={ onIncrementOctave } >
						<FontAwesomeIcon icon={ faChevronUp } />
					</ActionIcon>
				</ActionIcon.Group>
			</Group>
			<div
				ref={ ref }
				className={ classes.keyroll }
				style={{
					"--keyroll-width": `${elementWidth}px`,
					"--keyroll-height": `${elementHeight}px`,
					"--octave-count": octaveCount
				} as CSSProperties }
			>
				<div className={ classes.octaveWrap } data-orientation={ orientation } >
					{ octs }
				</div>
			</div>
		</div>
	);
});

KeyRoll.displayName = "KeyRoll";

export default KeyRoll;
