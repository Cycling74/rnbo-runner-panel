import { FunctionComponent, memo } from "react";
import InportEntry from "./inport";
import classes from "./ports.module.css";
import { GraphPatcherNodeRecord } from "../../models/graph";
import { MessageInportRecord } from "../../models/messages";

export type MessageInportListProps = {
	inports: GraphPatcherNodeRecord["messageInputs"];
	onSendMessage: (port: MessageInportRecord, value: string) => any;
}

const MessageInportList: FunctionComponent<MessageInportListProps> = memo(function WrappedMessageInportList({
	inports,
	onSendMessage
}) {

	return (
		<div className={ classes.portList }>
			{
				inports.valueSeq().map(inport => <InportEntry key={inport.id} port={ inport } onSend={ onSendMessage } />)
			}
		</div>
	);
});

export default MessageInportList;
