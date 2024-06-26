import { FormEvent, FunctionComponent, MouseEvent, memo, useCallback, useEffect, useState } from "react";
import { DataRefRecord } from "../../models/dataref";
import classes from "./datarefs.module.css";
import { ActionIcon, Group, Menu, Select, Table, Text, TextInput, Tooltip } from "@mantine/core";
import { Seq } from "immutable";
import { DataFileRecord } from "../../models/datafile";
import { IconElement } from "../elements/icon";
import { mdiCheck, mdiClose, mdiDotsVertical, mdiEraser, mdiPencil } from "@mdi/js";

interface DataRefEntryProps {
	dataref: DataRefRecord;
	options: Seq.Indexed<DataFileRecord>;
	onClear: (dataref: DataRefRecord) => any;
	onUpdate: (dataref: DataRefRecord, file: DataFileRecord) => any;
}

const DataRefEntry: FunctionComponent<DataRefEntryProps> = memo(function WrappedDataRefEntry({
	dataref,
	options,
	onClear,
	onUpdate
}: DataRefEntryProps) {

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [dataFile, setDataFile] = useState<DataFileRecord | undefined>(options.find(o => o.id === dataref.fileId));
	const [showDropDown, setShowDropDown] = useState<boolean>(true);

	const toggleEditing = useCallback(() => {
		if (isEditing) { // reset name upon blur
			setDataFile(options.find(o => o.id === dataref.fileId));
		}
		setIsEditing(!isEditing);
	}, [setIsEditing, isEditing, dataref, setDataFile, options]);

	const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (dataFile.id === dataref.fileId) {
			setIsEditing(false);
		} else {
			onUpdate(dataref, dataFile);
		}
	}, [dataFile, dataref, onUpdate, setIsEditing]);

	const onClearDataRef = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onClear(dataref);
	}, [onClear, dataref]);

	const onBlur = useCallback(() => setShowDropDown(false), [setShowDropDown]);
	const onFocus = useCallback(() => setShowDropDown(true), [setShowDropDown]);
	const onKeyDown = useCallback(() => setIsEditing(false), [setIsEditing]);

	const onChange = useCallback((value: string) => {
		setDataFile(options.find(o => o.id === value));
	}, [options, setDataFile]);

	useEffect(() => {
		setDataFile(options.find(o => o.id === dataref.fileId));
		setIsEditing(false);
	}, [dataref, options, setDataFile, setIsEditing]);

	return (
		<Table.Tr>
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ dataref.id }
				</Text>
			</Table.Td>
			<Table.Td>
				{
					isEditing ? (
						<form onSubmit={ onSubmit } >
							<Group gap="xs" wrap="nowrap" >
								<Select
									comboboxProps={{ width: "max-content", position: "bottom-start" }}
									allowDeselect={ false }
									flex={ 1 }
									autoFocus
									onBlur={ onBlur }
									onFocus={ onFocus}
									onChange={ onChange }
									data={ options.toArray().map(f => ({ value: f.id, label: f.fileName })) }
									placeholder="No file selected"
									size="sm"
									value={ dataFile?.id }
									dropdownOpened={ showDropDown }
									onKeyDown={ onKeyDown }
								/>
								<ActionIcon.Group>
									<ActionIcon variant="subtle" size="md" color="gray" onClick={ toggleEditing } >
										<IconElement path={ mdiClose } />
									</ActionIcon>
									<ActionIcon variant="subtle" size="md" type="submit">
										<IconElement path={ mdiCheck } />
									</ActionIcon>
								</ActionIcon.Group>
							</Group>
						</form>
					) : (
						<Group className={ classes.datarefFileLabel } wrap="nowrap" >
							<TextInput flex={ 1 } pointer variant="unstyled" size="sm" readOnly value={ dataFile?.fileName || "<none>" } onClick={ toggleEditing } />
							<ActionIcon onClick={ toggleEditing } variant="transparent" size="xs">
								<IconElement path={ mdiPencil } />
							</ActionIcon>
						</Group>
					)
				}
			</Table.Td>
			<Table.Td>
				<Group justify="flex-end">
					<Menu position="bottom-end">
						<Menu.Target>
							<Tooltip label="Open Buffer Action Menu">
								<ActionIcon variant="subtle" color="gray" >
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Buffer Actions</Menu.Label>
							<Menu.Item onClick={ toggleEditing } leftSection={ <IconElement path={ mdiPencil } /> } >
								Change Source
							</Menu.Item>
							<Menu.Item color="red" leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onClearDataRef } disabled={ !dataFile } >
								Clear Buffer Content
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
});

export default DataRefEntry;
