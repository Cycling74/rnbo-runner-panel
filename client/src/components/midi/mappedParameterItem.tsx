import { FC, memo, useCallback, useState } from "react";
import { PatcherInstanceRecord } from "../../models/instance";
import { ParameterRecord } from "../../models/parameter";
import { ActionIcon, Group, Menu, Table, Tooltip } from "@mantine/core";
import { mdiDotsVertical, mdiEraser, mdiPencil, mdiVectorSquare } from "@mdi/js";
import { IconElement } from "../elements/icon";
import classes from "./midi.module.css";
import { formatMIDIMappingToDisplay, formatParamValueForDisplay } from "../../lib/util";
import { EditableTableTextCell } from "../elements/editableTableCell";
import { MIDIMetaMapping } from "../../lib/types";
import { MIDIMetaMappingType } from "../../lib/constants";
import { Link, useLocation } from "react-router";

export type MIDIMappedParamProps = {
	instance: PatcherInstanceRecord;
	param: ParameterRecord;
	onClearMIDIMapping: (param: ParameterRecord) => void;
	onUpdateMIDIMapping: (param: ParameterRecord, value: string) => void;
};

const MIDIMappedParameter: FC<MIDIMappedParamProps> = memo(function WrappedMIDIMappedParam({
	instance,
	param,
	onClearMIDIMapping,
	onUpdateMIDIMapping
}) {

	const { search } = useLocation();
	const [isEditingMapping, setIsEditingMapping] = useState<boolean>(false);

	const onTriggerEditing = useCallback(() => {
		setIsEditingMapping(true);
	}, [setIsEditingMapping]);

	const onClearMapping = useCallback(() => {
		onClearMIDIMapping(param);
	}, [param, onClearMIDIMapping]);

	const onUpdateMapping = useCallback((value: string) => {
		onUpdateMIDIMapping(param, value);
	}, [param, onUpdateMIDIMapping]);

	return (
		<Table.Tr>
			<EditableTableTextCell
				className={ classes.midiSourceColumn }
				isEditing={ isEditingMapping }
				name="midi_source"
				onChangeEditingState={ setIsEditingMapping }
				onUpdate={ onUpdateMapping }
				value={ formatMIDIMappingToDisplay(param.midiMappingType as MIDIMetaMappingType, param.meta.midi as MIDIMetaMapping) }
			/>
			<Table.Td className={ classes.parameterNameColumn } >{ param.name }</Table.Td>
			<Table.Td className={ classes.patcherInstanceColumn } >
				<span className={ classes.patcherInstanceIndex } >{ instance.id }</span>
				<span className={ classes.patcherInstanceName } >{ instance.displayName }</span>
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
							<Menu.Label>MIDI Mapping</Menu.Label>
							<Menu.Item
								leftSection={ <IconElement path={ mdiVectorSquare } /> }
								component={ Link }
								to={{
									pathname: `/instances/${encodeURIComponent(instance.id)}`, search } }
							>
								Open Device Control
							</Menu.Item>
							<Menu.Item
								leftSection={ <IconElement path={ mdiPencil } /> }
								onClick={ onTriggerEditing }
							>
								Edit Mapping
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item color="red" leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onClearMapping } >
								Remove
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
});

export default MIDIMappedParameter;
