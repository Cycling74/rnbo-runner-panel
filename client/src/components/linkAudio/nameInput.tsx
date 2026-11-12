import { FC, FocusEvent, useEffect, useState } from "react";
import { TextInput } from "@mantine/core";

// On mobile, focusing an input in the lower half of the page pops up the on-screen keyboard,
// which can cover the focused field. Once the keyboard has animated in (~300ms), nudge the field
// toward the middle of the viewport so it stays visible above the keyboard. "center" keeps the
// input's label visible above it (unlike "start"). Touch devices only, so a mouse click on
// desktop doesn't trigger an unwanted scroll.
export const scrollInputIntoView = (e: FocusEvent<HTMLInputElement>): void => {
	if (!window.matchMedia("(pointer: coarse)").matches) return;
	const el = e.currentTarget;
	window.setTimeout(() => {
		el.scrollIntoView({ behavior: "smooth", block: "center" });
	}, 300);
};

export type LinkAudioNameInputProps = {
	label: string;
	placeholder: string;
	value: string;
	error?: (v: string) => string | null;
	onCommit: (v: string) => void;
};

// Text input that syncs from redux but only commits (sends OSC) on blur / Enter.
export const LinkAudioNameInput: FC<LinkAudioNameInputProps> = ({ label, placeholder, value, error, onCommit }) => {
	const [local, setLocal] = useState<string>(value);
	useEffect(() => { setLocal(value); }, [value]);
	const err = local === value ? null : (error ? error(local) : null);
	return (
		<TextInput
			label={ label }
			placeholder={ placeholder }
			value={ local }
			error={ err }
			onChange={ e => setLocal(e.currentTarget.value) }
			onFocus={ scrollInputIntoView }
			onBlur={ () => { if (local !== value && !(error && error(local))) onCommit(local); else setLocal(value); } }
			onKeyDown={ e => { if (e.key === "Enter") { e.currentTarget.blur(); } } }
			style={{ flex: 1 }}
		/>
	);
};
