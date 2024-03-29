import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import MessageOutportEntry from "./outport";
import { InstanceStateRecord } from "../../models/instance";

export type MessageOutportListProps = {
	outports: InstanceStateRecord["messageOutputs"];
}

const MessageOutportList: FunctionComponent<MessageOutportListProps> = memo(function WrappedMessageOutportList({
	outports
}) {

	return (
		<div className={ classes.portList }>
			{
				outports.entrySeq().map(([id, value]) => <MessageOutportEntry key={ id } id={ id } value={ value } />)
			}
		</div>
	);
});

export default MessageOutportList;
