import { FunctionComponent, memo, useCallback } from "react";
import classes from "./ports.module.css";
import { ActionIcon, Group, Menu, Table, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MessagePortRecord } from "../../models/messageport";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope } from "../../lib/constants";
import { IconElement } from "../elements/icon";
import { mdiCodeBraces, mdiDotsVertical, mdiRadioboxMarked, mdiSend } from "@mdi/js";

interface MessageInportEntryProps {
	port: MessagePortRecord;
	onSendBang: (port: MessagePortRecord) => void;
	onSendMessage: (port: MessagePortRecord) => void;
	onRestoreMetadata: (param: MessagePortRecord) => void;
	onSaveMetadata: (param: MessagePortRecord, meta: string) => void;
}

const MessageInportEntry: FunctionComponent<MessageInportEntryProps> = memo(function WrappedMessageInportEntry({
	port,
	onSendBang,
	onSendMessage,
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

	const sendMessage = useCallback(() => {
		onSendMessage(port);
	}, [onSendMessage, port]);

	const sendBang = useCallback(() => {
		onSendBang(port);
	}, [onSendBang, port]);

	return (
		<Table.Tr >
			{
				showMetaEditor ? (
					<MetaEditorModal
						onClose={ closeMetaEditor }
						onRestore={ onRestoreMeta }
						onSaveMeta={ onSaveMeta }
						meta={ port.metaString }
						name={ port.name }
						scope={ MetadataScope.Inport }
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
			<Table.Td>
				<Group justify="flex-end" gap="xs">
					<ActionIcon.Group>
						<Tooltip label="Send Bang">
							<ActionIcon variant="default" onClick={ sendBang } >
								<IconElement path={ mdiRadioboxMarked } />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Send Values">
							<ActionIcon variant="default" onClick={ sendMessage }>
								<IconElement path={ mdiSend } />
							</ActionIcon>
						</Tooltip>
					</ActionIcon.Group>
					<Menu position="bottom-end">
						<Menu.Target>
							<ActionIcon variant="subtle" color="gray" >
								<IconElement path={ mdiDotsVertical } />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Inport</Menu.Label>
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

export default MessageInportEntry;
