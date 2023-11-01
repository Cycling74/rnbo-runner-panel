import { Map as ImmuMap } from "immutable";
import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import { GraphPatcherNodeRecord } from "../../models/graph";
import MessageOutportEntry from "./outport";
import { MessageOutputRecord } from "../../models/messages";

export type MessageOutportListProps = {
	outports: GraphPatcherNodeRecord["messageOutputs"];
	values?: ImmuMap<MessageOutputRecord["id"], string>;
}

const MessageOutportList: FunctionComponent<MessageOutportListProps> = memo(function WrappedMessageOutportList({
	outports,
	values
}) {

	return (
		<div className={ classes.portList }>
			{
				outports.valueSeq().map(outport => <MessageOutportEntry key={outport.id} port={ outport } value={ values?.get(outport.id) || "" } />)
			}
		</div>
	);
});

export default MessageOutportList;
