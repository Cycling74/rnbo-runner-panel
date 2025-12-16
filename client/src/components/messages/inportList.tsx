import { FunctionComponent, memo } from "react";
import InportEntry from "./inport";
import classes from "./ports.module.css";
import { Seq } from "immutable";
import { MessagePortRecord } from "../../models/messageport";
import { Table } from "@mantine/core";

export type MessageInportListProps = {
	inports: Seq.Indexed<MessagePortRecord>;
	onSendBang: (port: MessagePortRecord) => void;
	onSendMessage: (port: MessagePortRecord) => void;
	onRestoreMetadata: (param: MessagePortRecord) => void;
	onSaveMetadata: (param: MessagePortRecord, meta: string) => void;
}

const MessageInportList: FunctionComponent<MessageInportListProps> = memo(function WrappedMessageInportList({
	inports,
	onSendBang,
	onSendMessage,
	onRestoreMetadata,
	onSaveMetadata
}) {

	return (
		<Table layout="fixed" className={ classes.portList } verticalSpacing="sm" maw="100%" highlightOnHover>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Inport</Table.Th>
					<Table.Th w={ 130 }></Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{
					inports.map(port => <InportEntry
						key={port.id}
						port={ port }
						onSendMessage={ onSendMessage }
						onSendBang={ onSendBang }
						onSaveMetadata={ onSaveMetadata }
						onRestoreMetadata={ onRestoreMetadata }
					/>)
				}
			</Table.Tbody>
		</Table>
	);
});

export default MessageInportList;
