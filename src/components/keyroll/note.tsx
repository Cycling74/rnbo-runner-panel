import { PointerEvent, FunctionComponent, memo } from "react";
import classes from "./keyroll.module.css";

export const keyWidth = 30;

interface NoteProps {
	index: number;
	isActive: boolean;
	isWhiteKey: boolean;
	note: number;
	onNoteOn: (n: number) => any;
	onNoteOff: (n: number) => any;
}

const Note: FunctionComponent<NoteProps> = memo(({
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
		<div
			className={ [classes.key, isWhiteKey ? classes.whiteKey : classes.blackKey].join(" ") }
			style={{ left: isWhiteKey ? index * keyWidth : index * keyWidth + 0.5 * keyWidth, width: keyWidth }}
			data-active={ isActive }
			onPointerEnter={ onPointerEnter }
			onPointerDown={ onPointerDown}
			onPointerLeave={ onPointerLeave }
			onPointerCancel={ onPointerUp }
			onPointerUp={ onPointerUp }
		/>
	);
});

Note.displayName = "Note";

export default Note;
