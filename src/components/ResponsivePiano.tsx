import { useContext } from "react";
import { DimensionsContext } from "../contexts/dimension";
import { Piano } from "react-piano";
import 'react-piano/dist/styles.css';

export default function ResponsivePiano({ noteRange, onNoteOn, onNoteOff }) {
	const dimensions = useContext(DimensionsContext);

	if (!dimensions) return null;

	return (
		<Piano
			noteRange={noteRange}
			width={dimensions.width}
			playNote={ onNoteOn }
			stopNote={ onNoteOff }
			disabled={false}
		/>
	);
}
