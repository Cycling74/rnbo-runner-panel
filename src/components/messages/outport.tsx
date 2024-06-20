import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import { TextInput } from "@mantine/core";
import { MessagePortRecord } from "../../models/messageport";

interface MessageOutportEntryProps {
	port: MessagePortRecord;
}

const MessageOutportEntry: FunctionComponent<MessageOutportEntryProps> = memo(function WrappedMessageOutportEntry({
	port
}) {

	return (
		<div className={ classes.outport } >
			<TextInput
				label={ port.id }
				size="sm"
				placeholder="No value received"
				readOnly
				value={ port.value }
			/>
		</div>
	);
});

export default MessageOutportEntry;
