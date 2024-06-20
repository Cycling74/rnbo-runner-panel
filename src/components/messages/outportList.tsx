import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import MessageOutportEntry from "./outport";
import { Seq } from "immutable";
import { MessagePortRecord } from "../../models/messageport";

export type MessageOutportListProps = {
	outports: Seq.Indexed<MessagePortRecord>;
}

const MessageOutportList: FunctionComponent<MessageOutportListProps> = memo(function WrappedMessageOutportList({
	outports
}) {

	return (
		<div className={ classes.portList }>
			{
				outports.map(port => <MessageOutportEntry key={ port.id } port={ port } />)
			}
		</div>
	);
});

export default MessageOutportList;
