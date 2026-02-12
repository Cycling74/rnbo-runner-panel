import { Map as ImmuMap } from "immutable";
import { FunctionComponent, MouseEvent, memo, useCallback, useEffect, useState } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import MessageInportList from "../messages/inportList";
import classes from "./instance.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { triggerSendInstanceInportMessage, sendInstanceInportBang } from "../../actions/patchers";
import { MessagePortRecord } from "../../models/messageport";
import { restoreDefaultMessagePortMetaOnRemote, setInstanceMessagePortMetaOnRemote,
	setInstanceWaitingForMidiMappingOnRemote, clearMessagePortMIDIMappingOnRemote,
	activateMessagePortMIDIMappingFocus
} from "../../actions/patchers";
import { ActionIcon, Group, Stack, Tooltip } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiMidiPort } from "@mdi/js";
import { SearchInput } from "../page/searchInput";

export type InstanceInportTabProps = {
	instance: PatcherInstanceRecord;
	messageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
}

const InstanceInportTab: FunctionComponent<InstanceInportTabProps> = memo(function WrappedInstanceMessagesTab({
	instance,
	messageInports
}) {

	const dispatch = useAppDispatch();
	const [searchValue, setSearchValue] = useState<string>("");

	const onSendInportMessage = useCallback((port: MessagePortRecord) => {
		dispatch(triggerSendInstanceInportMessage(instance, port));
	}, [dispatch, instance]);

	const onSendInportBang = useCallback((port: MessagePortRecord) => {
		dispatch(sendInstanceInportBang(instance, port));
	}, [dispatch, instance]);

	const onSavePortMetadata = useCallback((port: MessagePortRecord, meta: string) => {
		dispatch(setInstanceMessagePortMetaOnRemote(instance, port, meta));
	}, [dispatch, instance]);

	const onRestoreDefaultPortMetadata = useCallback((port: MessagePortRecord) => {
		dispatch(restoreDefaultMessagePortMetaOnRemote(instance, port));
	}, [dispatch, instance]);

	const onToggleMIDIMapping = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		e.currentTarget.blur();
		dispatch(setInstanceWaitingForMidiMappingOnRemote(instance.id, !instance.waitingForMidiMapping));
	}, [dispatch, instance]);

	const onActivateInportMIDIMapping = useCallback((port: MessagePortRecord) => {
		dispatch(activateMessagePortMIDIMappingFocus(instance, port));
	}, [instance, dispatch]);

	const onClearInportMidiMapping = useCallback((port: MessagePortRecord) => {
		dispatch(clearMessagePortMIDIMappingOnRemote(instance, port));
	}, [instance, dispatch]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Escape" && instance.waitingForMidiMapping && document.activeElement instanceof HTMLElement && document.activeElement.nodeName !== "INPUT") {
				dispatch(setInstanceWaitingForMidiMappingOnRemote(instance.id, false));
			}
		};
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [instance, dispatch]);

	useEffect(() => {
		return () => {
			dispatch(setInstanceWaitingForMidiMappingOnRemote(instance.id, false));
		};
	}, [instance.id, dispatch]);

	return (
		<Stack gap="xs">
			<Group justify="space-between">
				<Tooltip label={ instance.waitingForMidiMapping ? "Disable MIDI Mapping" : "Enable MIDI Mapping" } >
					<ActionIcon
						onClick={ onToggleMIDIMapping }
						variant={ instance.waitingForMidiMapping ? "filled" : "default" }
						color={ instance.waitingForMidiMapping ? "violet.4" : undefined }
					>
						<IconElement path={ mdiMidiPort } />
					</ActionIcon>
				</Tooltip>
				<Group justify="flex-end">
					<SearchInput onSearch={ setSearchValue } />
				</Group>
			</Group>
			{
				!messageInports.size ? (
					<div className={ classes.emptySection }>
						This device has no inports.
					</div>
				) :
					<MessageInportList
						inports={ messageInports.valueSeq().filter(p => p.matchesQuery(searchValue)) }
						onSendBang={ onSendInportBang }
						onSendMessage={ onSendInportMessage }
						onRestoreMetadata={ onRestoreDefaultPortMetadata }
						onSaveMetadata={ onSavePortMetadata }
						instanceIsMIDIMapping={ instance.waitingForMidiMapping }
						onActivateMIDIMapping={ onActivateInportMIDIMapping }
						onClearMIDIMapping={ onClearInportMidiMapping }
					/>
			}
		</Stack>
	);
});

export default InstanceInportTab;
