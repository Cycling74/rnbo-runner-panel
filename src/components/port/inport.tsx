import { useState } from "react";

interface InportEntryProps {
	name: string;
	onSend: (name: string, value: string) => any;
}

export default function InportEntry({ name, onSend }: InportEntryProps) {

	const [text, setText] = useState("");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setText(event.target.value);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (onSend) onSend(name, text);
	};

	return (
		<form className="inport" onSubmit={handleSubmit}>
			<div className="inportLabel">
				<label>{name}</label>
			</div>
			<div className="inportInput">
				<input type="text" value={text} onChange={handleChange}></input>
				<input className="smallButton" type="submit" value="Send"/>
			</div>
		</form>
	);
}
