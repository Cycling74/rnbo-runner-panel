import { FunctionComponent, memo, useCallback, useState } from "react";
import { Set as ImmuSet } from "immutable";
import { clamp } from "../../lib/util";
import Octave, { octaveWidth } from "./octave";
import classes from "./keyroll.module.css";
import { useElementSize } from "@mantine/hooks";

const baseOctave = 4;

export type KeyRollProps = {
	onTriggerNoteOn: (note: number) => any;
	onTriggerNoteOff: (note: number) => any;
};

export const KeyRoll: FunctionComponent<KeyRollProps> = memo(function WrappedKeyRoll({
	onTriggerNoteOn,
	onTriggerNoteOff
}) {
	const [activeNotes, setActiveNotes] = useState(ImmuSet<number>());

	const { ref, width } = useElementSize();
	const noOfOctaves = width === 0 ? 0 : clamp(Math.floor(width / octaveWidth), 1, 6);

	const onNoteOn = useCallback((p: number) => {
		onTriggerNoteOn(p);
		setActiveNotes((notes: ImmuSet<number>) => notes.add(p));
	}, [onTriggerNoteOn]);

	const onNoteOff = useCallback((p: number) => {
		onTriggerNoteOff(p);
		setActiveNotes((notes: ImmuSet<number>) => notes.delete(p));
	}, [onTriggerNoteOff]);

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
		<div ref={ ref } className={ classes.keyroll } >
			{ octs }
		</div>
	);
});

KeyRoll.displayName = "KeyRoll";

export default KeyRoll;
