import { FunctionComponent, memo, useState } from "react";
import classes from "./ports.module.css";
import { Button, Group, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { MessagePortRecord } from "../../models/messageport";

interface MessageInportEntryProps {
	port: MessagePortRecord;
	onSend: (port: MessagePortRecord, value: string) => any;
}

const MessageInportEntry: FunctionComponent<MessageInportEntryProps> = memo(function WrappedMessageInportEntry({
	port, onSend
}) {

	const [text, setText] = useState("");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setText(event.target.value);
	};

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (onSend) onSend(port, text);
	};

	return (
		<form className={ classes.inport } onSubmit={handleSubmit} >
			<Group align="flex-end">
				<TextInput
					label={ port.id }
					description={ `Send data to the inport with name "${port.name}"`}
					onChange={ handleChange }
					size="sm"
					value={ text }
					style={{ flex: 1 }}
				/>
				<Button variant="outline" size="sm" type="submit"><FontAwesomeIcon icon={ faPaperPlane } /></Button>
			</Group>
		</form>
	);
});

export default MessageInportEntry;
