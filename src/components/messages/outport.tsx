import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import { TextInput } from "@mantine/core";
import { MessagePortRecord } from "../../models/messageport";

interface MessageOutportEntryProps {
	port: MessagePortRecord;
	outputEnabled: boolean;
}

const MessageOutportEntry: FunctionComponent<MessageOutportEntryProps> = memo(function WrappedMessageOutportEntry({
	port,
	outputEnabled
}) {

	// TODO should there be some sort of tooltip or some indication if output isn't enabled?

	return (
		<div className={ classes.outport } >
			<TextInput
				label={ port.id }
				size="sm"
				placeholder="No value received"
				disabled={ !outputEnabled }
				readOnly
				value={ port.value }
			/>
		</div>
	);
});

export default MessageOutportEntry;
