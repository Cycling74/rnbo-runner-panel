import { memo } from "react";
import { Piano } from "react-piano";
import "react-piano/dist/styles.css";
import { useDimensions } from "../hooks/useDimensions";

type ResponsivePianoParams = {
	noteRange: { first: number, last: number};
	onNoteOn: (p: number) => void;
	onNoteOff: (p: number) => void;
}

const ResponsivePiano = memo(function WrappedResponsivePiano({ noteRange, onNoteOn, onNoteOff }: ResponsivePianoParams) {

	const dimensions = useDimensions();

	return (
		<Piano
			noteRange={noteRange}
			width={dimensions.width}
			playNote={ onNoteOn }
			stopNote={ onNoteOff }
			disabled={false}
		/>
	);
});

export default ResponsivePiano;
