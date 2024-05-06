import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import { TextInput } from "@mantine/core";

interface MessageOutportEntryProps {
	id: string;
	value: string;
}

const MessageOutportEntry: FunctionComponent<MessageOutportEntryProps> = memo(function WrappedMessageOutportEntry({ id, value }) {

	return (
		<div className={ classes.outport } >
			<TextInput
				label={ id }
				size="sm"
				placeholder="No value received"
				readOnly
				value={ value }
			/>
		</div>
	);
});

export default MessageOutportEntry;
