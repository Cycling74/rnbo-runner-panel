import { useContext, memo } from "react";
import { DimensionsContext } from "../contexts/dimension";
import { Piano } from "react-piano";
import 'react-piano/dist/styles.css';

type ResponsivePianoParams = {
	noteRange: { first: number, last: number};
	onNoteOn: (p: number) => void;
	onNoteOff: (p: number) => void;
}

const ResponsivePiano = memo(function WrappedResponsivePiano({ noteRange, onNoteOn, onNoteOff }: ResponsivePianoParams) {
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
});

export default ResponsivePiano;
