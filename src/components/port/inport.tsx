import { useState } from "react";
import classes from "./ports.module.css";
import { Button, Group, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

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
		<form className={ classes.inport } onSubmit={handleSubmit} >
			<Group align="flex-end">
				<TextInput
					label={ name }
					description={ `Send data to the inport with name "${name}"`}
					onChange={ handleChange }
					size="sm"
					value={ text }
					style={{ flex: 1 }}
				/>
				<Button variant="outline" size="sm" type="submit"><FontAwesomeIcon icon={ faPaperPlane } /></Button>
			</Group>
		</form>
	);
}
