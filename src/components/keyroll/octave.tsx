import { FunctionComponent, memo } from "react";
import { Set as ImmuSet } from "immutable";
import styled from "styled-components";
import Note, { keyWidth } from "./note";

export const octaveWidth = keyWidth * 7;

const OctaveElement = styled.div`
	height: 150px;
	position: relative;
	user-select: none;
	width: ${octaveWidth}px;

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

export default Octave;
