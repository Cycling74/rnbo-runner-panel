import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import MessageOutportEntry from "./outport";
import { DeviceStateRecord } from "../../models/device";

export type MessageOutportListProps = {
	outports: DeviceStateRecord["messageOutputs"];
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
