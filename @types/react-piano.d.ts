declare module "react-piano" {
	import { Component, ReactNode } from "react";
	export interface KeyboardShortcut {
		key: string;
		midiNumber: number;
	}

	export class Piano extends Component<{
		noteRange: { first: number; last: number };
		playNote: (midi: number) => any;
		stopNote: (midi: number) => any;
		width?: number;
		activeNotes?: number[];
		keyWidthToHeight?: number;
		renderNoteLabel?: ({ keyboardShortcut: any, midiNumber: number, isActive: boolean, isAccidental: boolean }) => ReactNode;
		className?: string;
		disabled?: boolean;
		keyboardShortcuts?: KeyboardShortcut[];
		onPlayNoteInput?: (midi: number, { prevActiveNotes }:  { prevActiveNotes: number[] }) => any;
		onStopNoteInput?: (midi: number, { prevActiveNotes }:  { prevActiveNotes: number[] }) => any;
	}> {}

	interface MidiNumbersHelpers {
		fromNote: (note: string) => number;
	}

	export const MidiNumbers: MidiNumbersHelpers;
}
