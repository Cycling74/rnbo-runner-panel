import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import { TextInput } from "@mantine/core";
import { MessageOutputRecord } from "../../models/messages";

interface MessageOutportEntryProps {
	port: MessageOutputRecord;
}

const MessageOutportEntry: FunctionComponent<MessageOutportEntryProps> = memo(function WrappedMessageOutportEntry({ port }) {

	return (
		<div className={ classes.outport } >
			<TextInput
				label={ port.name }
				size="sm"
				placeholder="No value received"
				readOnly
				value={ port.lastValue || "" }
			/>
		</div>
	);
});

export default MessageOutportEntry;
