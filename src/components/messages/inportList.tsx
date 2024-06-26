import { FunctionComponent, memo } from "react";
import InportEntry from "./inport";
import classes from "./ports.module.css";
import { Seq } from "immutable";
import { MessagePortRecord } from "../../models/messageport";

export type MessageInportListProps = {
	inports: Seq.Indexed<MessagePortRecord>;
	onSendMessage: (port: MessagePortRecord, value: string) => any;
	onRestoreMetadata: (param: MessagePortRecord) => any;
	onSaveMetadata: (param: MessagePortRecord, meta: string) => any;
}

const MessageInportList: FunctionComponent<MessageInportListProps> = memo(function WrappedMessageInportList({
	inports,
	onSendMessage,
	onRestoreMetadata,
	onSaveMetadata
}) {

	return (
		<div className={ classes.portList }>
			{
				inports.map(port => <InportEntry
					key={port.id}
					port={ port }
					onSend={ onSendMessage }
					onSaveMetadata={ onSaveMetadata }
					onRestoreMetadata={ onRestoreMetadata }
				/>)
			}
		</div>
	);
});

export default MessageInportList;
