import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import { GraphPatcherNodeRecord } from "../../models/graph";
import MessageOutportEntry from "./outport";

export type MessageOutportListProps = {
	outports: GraphPatcherNodeRecord["messageOutputs"];
}

const MessageOutportList: FunctionComponent<MessageOutportListProps> = memo(function WrappedMessageOutportList({
	outports
}) {

	return (
		<div className={ classes.portList }>
			{
				outports.valueSeq().map(outport => <MessageOutportEntry key={outport.id} port={ outport } />)
			}
		</div>
	);
});

export default MessageOutportList;
