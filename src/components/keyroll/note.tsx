import { PointerEvent, FunctionComponent, memo } from "react";
import styled from "styled-components";

export const keyWidth = 30;

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
		left: isWhiteKey ? index * keyWidth : index * keyWidth + 0.5 * keyWidth,
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
	width: ${keyWidth}px;
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

export default Note;
