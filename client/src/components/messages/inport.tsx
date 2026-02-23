import { FunctionComponent, memo, useCallback } from "react";
import classes from "./ports.module.css";
import { ActionIcon, Group, Indicator, Menu, Table, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MessagePortRecord } from "../../models/messageport";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope, MIDIMetaMappingType } from "../../lib/constants";
import { IconElement } from "../elements/icon";
import { mdiCodeBraces, mdiDotsVertical, mdiEraser, mdiRadioboxMarked, mdiSend } from "@mdi/js";
import { formatMIDIMappingToDisplay } from "../../lib/util";

interface MessageInportEntryProps {
	port: MessagePortRecord;
	onSendBang: (port: MessagePortRecord) => void;
	onSendMessage: (port: MessagePortRecord) => void;
	onRestoreMetadata: (param: MessagePortRecord) => void;
	onSaveMetadata: (param: MessagePortRecord, meta: string) => void;
	onActivateMIDIMapping: (port: MessagePortRecord) => void;
	onClearMIDIMapping: (port: MessagePortRecord) => void;
	instanceIsMIDIMapping: boolean;
}

const MessageInportEntry: FunctionComponent<MessageInportEntryProps> = memo(function WrappedMessageInportEntry({
	port,
	onSendBang,
	onSendMessage,
	onSaveMetadata,
	onRestoreMetadata,
	onActivateMIDIMapping,
	onClearMIDIMapping,
	instanceIsMIDIMapping
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

	const onActivateMapping = useCallback(() => {
		if (port.waitingForMidiMapping || !instanceIsMIDIMapping) return;
		onActivateMIDIMapping(port);
	}, [port, instanceIsMIDIMapping, onActivateMIDIMapping]);

	const onClearMapping = useCallback(() => {
		onClearMIDIMapping(port);
	}, [port, onClearMIDIMapping]);

	const indicatorText = port.isMidiMapped
		? formatMIDIMappingToDisplay(port.midiMappingType as MIDIMetaMappingType, port.meta.midi)
		: null;

	return (
		<Table.Tr
			className={ classes.portItem }
			data-instance-mapping={ instanceIsMIDIMapping }
			data-port-mapping={ port.waitingForMidiMapping }
		>
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
			<Table.Td onClick={ onActivateMapping }>
				<Group justify="space-between">
					<Tooltip label={ indicatorText } disabled={ !indicatorText }>
						<Indicator
							position="middle-end"
							disabled={ !indicatorText }
							classNames={{ root: classes.portItemMIDIIndicator }}
						>
							<label htmlFor={ port.name } className={ classes.portItemLabel } >
								{ port.name }
							</label>
						</Indicator>
					</Tooltip>
				</Group>
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
							<Menu.Divider />
							<Menu.Item leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onClearMapping } disabled= { !port.isMidiMapped }>
									Clear MIDI Mapping
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
});

export default MessageInportEntry;
