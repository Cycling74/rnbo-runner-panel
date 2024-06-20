import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import MessageOutportEntry from "./outport";
import { Seq } from "immutable";
import { MessagePortRecord } from "../../models/messageport";

export type MessageOutportListProps = {
	outports: Seq.Indexed<MessagePortRecord>;
	outputEnabled: boolean;
	onRestoreMetadata: (param: MessagePortRecord) => any;
	onSaveMetadata: (param: MessagePortRecord, meta: string) => any;
}

const MessageOutportList: FunctionComponent<MessageOutportListProps> = memo(function WrappedMessageOutportList({
	outports,
	outputEnabled,
	onRestoreMetadata,
	onSaveMetadata
}) {

	return (
		<div className={ classes.portList }>
			{
				outports.map(port => <MessageOutportEntry
					key={ port.id }
					port={ port }
					outputEnabled={ outputEnabled }
					onSaveMetadata={ onSaveMetadata }
					onRestoreMetadata={ onRestoreMetadata }
				/>)
			}
		</div>
	);
});

export default MessageOutportList;
