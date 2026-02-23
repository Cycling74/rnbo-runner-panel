import { FunctionComponent, memo, useRef } from "react";
import InportEntry from "./inport";
import classes from "./ports.module.css";
import { Seq } from "immutable";
import { MessagePortRecord } from "../../models/messageport";
import { Table } from "@mantine/core";
import { useThemeColorScheme } from "../../hooks/useTheme";

export type MessageInportListProps = {
	inports: Seq.Indexed<MessagePortRecord>;
	instanceIsMIDIMapping: boolean;
	onSendBang: (port: MessagePortRecord) => void;
	onSendMessage: (port: MessagePortRecord) => void;
	onRestoreMetadata: (param: MessagePortRecord) => void;
	onSaveMetadata: (param: MessagePortRecord, meta: string) => void;
	onActivateMIDIMapping: (port: MessagePortRecord) => void;
	onClearMIDIMapping: (port: MessagePortRecord) => void;
}

const MessageInportList: FunctionComponent<MessageInportListProps> = memo(function WrappedMessageInportList({
	inports,
	instanceIsMIDIMapping,
	onSendBang,
	onSendMessage,
	onRestoreMetadata,
	onSaveMetadata,
	onActivateMIDIMapping,
	onClearMIDIMapping
}) {

	const ref = useRef<HTMLDivElement>();
	const colorScheme  = useThemeColorScheme();

	return (
		<div ref={ ref } className={ classes.portList } data-color-scheme={ colorScheme }>
			<Table layout="fixed"  verticalSpacing="sm" maw="100%" highlightOnHover>
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
							onActivateMIDIMapping={ onActivateMIDIMapping }
							onClearMIDIMapping={ onClearMIDIMapping }
							instanceIsMIDIMapping= { instanceIsMIDIMapping }
						/>)
					}
				</Table.Tbody>
			</Table>
		</div>
	);
});

export default MessageInportList;
