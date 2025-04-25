import { FunctionComponent, memo } from "react";
import classes from "./ports.module.css";
import MessageOutportEntry from "./outport";
import { Seq } from "immutable";
import { MessagePortRecord } from "../../models/messageport";
import { Table } from "@mantine/core";

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
		<Table layout="fixed" className={ classes.portList } verticalSpacing="sm" maw="100%" highlightOnHover>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Outport</Table.Th>
					{ outputEnabled ? <Table.Th>Value</Table.Th> : null }
					<Table.Th w={ 60 }></Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{
					outports.map(port => <MessageOutportEntry
						key={ port.id }
						port={ port }
						outputEnabled={ outputEnabled }
						onSaveMetadata={ onSaveMetadata }
						onRestoreMetadata={ onRestoreMetadata }
					/>)
				}
			</Table.Tbody>
		</Table>
	);
});

export default MessageOutportList;
