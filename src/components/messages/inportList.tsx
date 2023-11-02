import { FunctionComponent, memo } from "react";
import InportEntry from "./inport";
import classes from "./ports.module.css";
import { DeviceStateRecord } from "../../models/device";

export type MessageInportListProps = {
	inports: DeviceStateRecord["messageInputs"];
	onSendMessage: (id: string, value: string) => any;
}

const MessageInportList: FunctionComponent<MessageInportListProps> = memo(function WrappedMessageInportList({
	inports,
	onSendMessage
}) {

	return (
		<div className={ classes.portList }>
			{
				inports.keySeq().map((id) => <InportEntry key={id} id={ id } onSend={ onSendMessage } />)
			}
		</div>
	);
});

export default MessageInportList;
