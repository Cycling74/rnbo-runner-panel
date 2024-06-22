import { FunctionComponent, memo, useCallback } from "react";
import classes from "./ports.module.css";
import { ActionIcon, Group, Menu, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MessagePortRecord } from "../../models/messageport";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope } from "../../lib/constants";

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

	// TODO should there be some sort of tooltip or some indication if output isn't enabled?

	return (
		<div className={ classes.outport } >
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
			<Group>
				<TextInput
					size="sm"
					placeholder="No value received"
					disabled={ !outputEnabled }
					readOnly
					value={ port.value }
				/>
				<Menu position="bottom-end">
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray" size="md">
							<FontAwesomeIcon icon={ faEllipsisVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Actions</Menu.Label>
						<Menu.Item leftSection={ <FontAwesomeIcon fixedWidth icon={ faCode } /> } onClick={ toggleMetaEditor }>
							Edit Metadata
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</div>
	);
});

export default MessageOutportEntry;
