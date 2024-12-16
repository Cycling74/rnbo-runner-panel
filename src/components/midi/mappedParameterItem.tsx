import { FC, memo, useCallback } from "react";
import { PatcherInstanceRecord } from "../../models/instance";
import { ParameterRecord } from "../../models/parameter";
import { ActionIcon, Group, Menu, Table, Text, Tooltip } from "@mantine/core";
import { mdiDotsVertical, mdiEraser, mdiVectorSquare } from "@mdi/js";
import { IconElement } from "../elements/icon";
import { modals } from "@mantine/modals";
import Link from "next/link";
import { useRouter } from "next/router";
import classes from "./midi.module.css";
import { formatParamValueForDisplay } from "../../lib/util";

export type MIDIMappedParamProps = {
	instance: PatcherInstanceRecord;
	param: ParameterRecord;
	onClearMIDIMapping: (instance: PatcherInstanceRecord, param: ParameterRecord) => void;
};

const MIDIMappedParameter: FC<MIDIMappedParamProps> = memo(function WrappedMIDIMappedParam({
	instance,
	param,
	onClearMIDIMapping
}) {

	const { query: restQuery } = useRouter();

	const onClearMapping = useCallback(() => {
		modals.openConfirmModal({
			title: "Clear Parameter MIDI Mapping",
			centered: true,
			children: (
				<Text size="sm" id="red">
					Are you sure you want to remove the active MIDI mapping for { `"${param.name}"` } on patcher instance { `"${instance.displayName}"` }?
				</Text>
			),
			labels: { confirm: "Remove", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => onClearMIDIMapping(instance, param)
		});
	}, [param, instance]);

	return (
		<Table.Tr>
			<Table.Td className={ classes.midiChannelColumn } >{ param.meta.midi?.chan || ""}</Table.Td>
			<Table.Td className={ classes.midiControlColumn } >{ param.meta.midi?.ctrl || ""}</Table.Td>
			<Table.Td className={ classes.parameterNameColumn } >{ param.name }</Table.Td>
			<Table.Td className={ classes.patcherInstanceColumn } >
				<span className={ classes.patcherInstanceIndex } >{ instance.index }</span>
				<span className={ classes.patcherInstanceName } >: {instance.name}</span>
			</Table.Td>
			<Table.Td className={ classes.parameterValueColumn } >{ formatParamValueForDisplay(param.value) }</Table.Td>
			<Table.Td className={ classes.actionColumn } >
				<Group justify="flex-end">
					<Menu position="bottom-end">
						<Menu.Target>
							<Tooltip label="Open Action Menu">
								<ActionIcon variant="subtle" color="gray" >
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>MIDI Mapping Actions</Menu.Label>
							<Menu.Item
								leftSection={ <IconElement path={ mdiVectorSquare } /> }
								component={ Link }
								href={{ pathname: "/instances/[index]", query: { ...restQuery, index: instance.index } }}
							>
								Show Instance
							</Menu.Item>
							<Menu.Item color="red" leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onClearMapping } >
								Remove MIDI Mapping
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
});

export default MIDIMappedParameter;
