import { FunctionComponent, memo, useState, useCallback } from "react";
import classes from "./ports.module.css";
import { ActionIcon, Button, Group, Menu, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faEllipsisVertical, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { MessagePortRecord } from "../../models/messageport";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope } from "../../lib/constants";

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
		if (onSend) {
			onSend(port, text);
		}
	}, [onSend, port, text]);

	return (
		<div className={ classes.inport } >
			{
				showMetaEditor ? (
					<MetaEditorModal
						onClose={ closeMetaEditor }
						onRestore={ onRestoreMeta }
						onSaveMeta={ onSaveMeta }
						meta={ port.meta }
						name={ port.name }
						scope={ MetadataScope.Outport }
					/>
				) : null
			}
			<Group justify="space-between">
				<label htmlFor={ port.name } className={ classes.portItemLabel } >{ port.name }</label>
			</Group>
			<Group align="flex-end">
				<TextInput
					description={ `Send data to the inport with name "${port.name}"`}
					onChange={ handleChange }
					size="sm"
					value={ text }
					style={{ flex: 1 }}
				/>
				<Button variant="outline" size="sm" onClick={ sendMessage } >
					<FontAwesomeIcon icon={ faPaperPlane } />
				</Button>
				<Menu position="bottom-end">
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray" size="md">
							<FontAwesomeIcon icon={ faEllipsisVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Actions</Menu.Label>
						<Menu.Item leftSection={ <FontAwesomeIcon icon={ faCode } /> } onClick={ toggleMetaEditor }>
							Edit Metadata
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</div>
	);
});

export default MessageInportEntry;
