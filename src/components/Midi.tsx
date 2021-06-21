import { useContext } from "react";
import { DeviceContext } from "../contexts/device";
import { Piano, MidiNumbers } from "react-piano";
import { DimensionsProvider } from "../contexts/dimension";
import ResponsivePiano from "./ResponsivePiano";

const noteRange = {
	first: MidiNumbers.fromNote('c3'),
	last: MidiNumbers.fromNote('f4'),
  };

export default function Midi({ onNoteOn, onNoteOff }) {

	const {device} = useContext(DeviceContext);

	return  (
		<DimensionsProvider>
			<ResponsivePiano noteRange={noteRange} onNoteOn={onNoteOn} onNoteOff={onNoteOff}/>
		</DimensionsProvider>
	);
}
