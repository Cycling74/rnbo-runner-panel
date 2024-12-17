import { FunctionComponent, memo, useState, useCallback } from "react";
import classes from "./ports.module.css";
import { ActionIcon, Button, Group, Menu, TextInput, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MessagePortRecord } from "../../models/messageport";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope } from "../../lib/constants";
import { IconElement } from "../elements/icon";
import { mdiCodeBraces, mdiDotsVertical, mdiSend } from "@mdi/js";

interface MessageInportEntryProps {
	port: MessagePortRecord;
	onSend: (port: MessagePortRecord, value: string) => any;
	onRestoreMetadata: (param: MessagePortRecord) => any;
	onSaveMetadata: (param: MessagePortRecord, meta: string) => any;
}

const MessageInportEntry: FunctionComponent<MessageInportEntryProps> = memo(function WrappedMessageInportEntry({
	port,
	onSend,
	onSaveMetadata,
	onRestoreMetadata
}) {

	const [text, setText] = useState("");
	const [showMetaEditor, { toggle: toggleMetaEditor, close: closeMetaEditor }] = useDisclosure();

	const onSaveMeta = useCallback((meta: string) => {
		onSaveMetadata(port, meta);
	}, [port, onSaveMetadata]);

	const onRestoreMeta = useCallback(() => {
		onRestoreMetadata(port);
	}, [port, onRestoreMetadata]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setText(event.target.value);
	};

	const sendMessage = useCallback(() => {
		onSend(port, text);
	}, [onSend, port, text]);

	return (
		<div className={ classes.inport } >
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
			<Group justify="space-between">
				<label htmlFor={ port.name } className={ classes.portItemLabel } >{ port.name }</label>
			</Group>
			<Group>
				<TextInput
					onChange={ handleChange }
					size="sm"
					value={ text }
					style={{ flex: 1 }}
				/>
				<Tooltip label={ `Send data to the inport with name "${port.name}"`} >
					<Button variant="outline" size="sm" onClick={ sendMessage } >
						<IconElement path={ mdiSend } />
					</Button>
				</Tooltip>
				<Menu position="bottom-end">
					<Menu.Target>
						<Tooltip label="Open Inport Action Menu">
							<ActionIcon variant="subtle" color="gray" size="md">
								<IconElement path={ mdiDotsVertical } />
							</ActionIcon>
						</Tooltip>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Inport Actions</Menu.Label>
						<Menu.Item leftSection={ <IconElement path={ mdiCodeBraces } /> } onClick={ toggleMetaEditor }>
							Edit Metadata
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</div>
	);
});

export default MessageInportEntry;
