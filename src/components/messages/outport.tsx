import { FunctionComponent, memo, useCallback } from "react";
import classes from "./ports.module.css";
import { ActionIcon, Group, Menu, Table, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MessagePortRecord } from "../../models/messageport";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope } from "../../lib/constants";
import { IconElement } from "../elements/icon";
import { mdiCodeBraces, mdiDotsVertical } from "@mdi/js";

interface MessageOutportEntryProps {
	port: MessagePortRecord;
	outputEnabled: boolean;
	onRestoreMetadata: (param: MessagePortRecord) => any;
	onSaveMetadata: (param: MessagePortRecord, meta: string) => any;
}

const MessageOutportEntry: FunctionComponent<MessageOutportEntryProps> = memo(function WrappedMessageOutportEntry({
	port,
	outputEnabled,
	onSaveMetadata,
	onRestoreMetadata
}) {

	const [showMetaEditor, { toggle: toggleMetaEditor, close: closeMetaEditor }] = useDisclosure();

	const onSaveMeta = useCallback((meta: string) => {
		onSaveMetadata(port, meta);
	}, [port, onSaveMetadata]);

	const onRestoreMeta = useCallback(() => {
		onRestoreMetadata(port);
	}, [port, onRestoreMetadata]);

	return (
		<Table.Tr className={ classes.outport } >
			{
				showMetaEditor ? (
					<MetaEditorModal
						onClose={ closeMetaEditor }
						onRestore={ onRestoreMeta }
						onSaveMeta={ onSaveMeta }
						meta={ port.metaString }
						name={ port.name }
						scope={ MetadataScope.Outport }
					/>
				) : null
			}
			<Table.Td>
				<label htmlFor={ port.name } className={ classes.portItemLabel } >
					<Text fz="sm" truncate="end">
						{ port.name }
					</Text>
				</label>
			</Table.Td>
			{
				outputEnabled ? (
					<Table.Td>
						<Text fz="sm" truncate="end" c="dimmed">
							{ port.value === "" ? "No Value Received" : port.value }
						</Text>
					</Table.Td>
				) : null
			}
			<Table.Td>
				<Group justify="flex-end">
					<Menu position="bottom-end">
						<Menu.Target>
							<ActionIcon variant="subtle" color="gray" >
								<IconElement path={ mdiDotsVertical } />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Outport</Menu.Label>
							<Menu.Item leftSection={ <IconElement path={ mdiCodeBraces } /> } onClick={ toggleMetaEditor }>
								Edit Metadata
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
});

export default MessageOutportEntry;
