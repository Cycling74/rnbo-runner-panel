import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import { TextInput } from "@mantine/core";
import { MessageOutputRecord } from "../../models/messages";

interface MessageOutportEntryProps {
	port: MessageOutputRecord;
	value: string;
}

const MessageOutportEntry: FunctionComponent<MessageOutportEntryProps> = memo(function WrappedMessageOutportEntry({ port, value }) {

	return (
		<div className={ classes.outport } >
			<TextInput
				label={ port.name }
				size="sm"
				placeholder="No value received"
				readOnly
				value={ value }
			/>
		</div>
	);
});

export default MessageOutportEntry;
