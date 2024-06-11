import { FormEvent, FunctionComponent, MouseEvent, memo, useCallback, useEffect, useState } from "react";
import { DataRefRecord } from "../../models/dataref";
import classes from "./datarefs.module.css";
import { ActionIcon, Group, Menu, Select, Table, Text, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faPen, faEraser, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { Seq } from "immutable";

interface DataRefEntryProps {
	dataref: DataRefRecord;
	options: Seq.Indexed<string>;
	onClear: (dataref: DataRefRecord) => any;
	onUpdate: (dataref: DataRefRecord, fileName: string) => any;
}

const DataRefEntry: FunctionComponent<DataRefEntryProps> = memo(function WrappedDataRefEntry({
	dataref,
	options,
	onClear,
	onUpdate
}: DataRefEntryProps) {

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>(dataref.fileName);
	const [showDropDown, setShowDropDown] = useState<boolean>(true);

	const toggleEditing = useCallback(() => {
		if (isEditing) { // reset name upon blur
			setFileName(dataref.fileName);
		}
		setIsEditing(!isEditing);
	}, [setIsEditing, isEditing, dataref, setFileName]);

	const onUpdateFileName = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onUpdate(dataref, fileName);
	}, [fileName, dataref, onUpdate]);

	const onClearDataRef = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onClear(dataref);
	}, [onClear, dataref]);

	const onBlur = useCallback(() => setShowDropDown(false), [setShowDropDown]);
	const onFocus = useCallback(() => setShowDropDown(true), [setShowDropDown]);
	const onKeyDown = useCallback(() => setIsEditing(false), [setIsEditing]);

	const onChange = useCallback((value: string) => {
		setFileName(value);
	}, [setFileName]);

	useEffect(() => {
		setFileName(dataref.fileName);
		setIsEditing(false);
	}, [dataref, setFileName, setIsEditing]);

	return (
		<Table.Tr>
			<Table.Td>
				<Text fz="sm">
					{ dataref.id }
				</Text>
			</Table.Td>
			<Table.Td>
				{
					isEditing ? (
						<form onSubmit={ onUpdateFileName } >
							<Group gap="xs" wrap="nowrap" >
								<Select
									comboboxProps={{ width: "max-content", position: "bottom-start" }}
									allowDeselect={ false }
									flex={ 1 }
									autoFocus
									onBlur={ onBlur }
									onFocus={ onFocus}
									onChange={ onChange }
									data={ options.toArray() }
									placeholder="No file selected"
									size="sm"
									value={ fileName }
									dropdownOpened={ showDropDown }
									onKeyDown={ onKeyDown }
								/>
								<ActionIcon.Group>
									<ActionIcon variant="subtle" size="md" color="gray" onClick={ toggleEditing } >
										<FontAwesomeIcon icon={ faClose } />
									</ActionIcon>
									<ActionIcon variant="subtle" size="md" type="submit">
										<FontAwesomeIcon icon={ faCheck } />
									</ActionIcon>
								</ActionIcon.Group>
							</Group>
						</form>
					) : (
						<Group className={ classes.datarefFileLabel } wrap="nowrap" >
							<TextInput flex={ 1 } pointer variant="unstyled" size="sm" readOnly value={ fileName } onClick={ toggleEditing } />
							<ActionIcon onClick={ toggleEditing } variant="transparent" size="xs">
								<FontAwesomeIcon icon={ faPen } />
							</ActionIcon>
						</Group>
					)
				}
			</Table.Td>
			<Table.Td>
				<Group justify="flex-end">
					<Menu position="bottom-end">
						<Menu.Target>
							<ActionIcon variant="subtle" color="gray" >
								<FontAwesomeIcon icon={ faEllipsisVertical } />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Actions</Menu.Label>
							<Menu.Item color="red" leftSection={ <FontAwesomeIcon icon={ faEraser } /> } onClick={ onClearDataRef } >Clear Buffer</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
});

export default DataRefEntry;
