import { FunctionComponent, memo } from "react";
import { Set as ImmuSet } from "immutable";
import Note, { keyWidth } from "./note";
import classes from "./keyroll.module.css";

export const octaveWidth = keyWidth * 7;

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
		<div className={ classes.octave } style={{ width: octaveWidth }}>
			<div>
				{ blackNotes }
				{ whiteNotes }
			</div>
		</div>
	);
});

Octave.displayName = "OctaveName";

export default Octave;
