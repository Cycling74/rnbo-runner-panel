import { FormEvent, FunctionComponent, MouseEvent, memo, useCallback, useEffect, useState } from "react";
import { DataRefRecord } from "../../models/dataref";
import classes from "./datarefs.module.css";
import { ActionIcon, Group, Menu, Select, Table, Text, TextInput, Tooltip } from "@mantine/core";
import { Seq } from "immutable";
import { DataFileRecord } from "../../models/datafile";
import { IconElement } from "../elements/icon";
import { mdiCheck, mdiClose, mdiCodeBraces, mdiDotsVertical, mdiEraser, mdiPencil } from "@mdi/js";
import { useDisclosure } from "@mantine/hooks";
import { MetadataScope } from "../../lib/constants";
import { MetaEditorModal } from "../meta/metaEditorModal";

interface DataRefEntryProps {
	dataRef: DataRefRecord;
	options: Seq.Indexed<DataFileRecord>;
	onClear: (dataref: DataRefRecord) => void;
	onUpdate: (dataref: DataRefRecord, file: DataFileRecord) => void;
	onRestoreMetadata: (param: DataRefRecord) => void;
	onSaveMetadata: (param: DataRefRecord, meta: string) => void;
}

const DataRefEntry: FunctionComponent<DataRefEntryProps> = memo(function WrappedDataRefEntry({
	dataRef,
	options,
	onClear,
	onUpdate,
	onRestoreMetadata,
	onSaveMetadata
}: DataRefEntryProps) {

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [dataFile, setDataFile] = useState<DataFileRecord | undefined>(options.find(o => o.id === dataRef.value));
	const [showDropDown, setShowDropDown] = useState<boolean>(true);

	const [showMetaEditor, { toggle: toggleMetaEditor, close: closeMetaEditor }] = useDisclosure();
	const onSaveMeta = useCallback((meta: string) => onSaveMetadata(dataRef, meta), [dataRef, onSaveMetadata]);
	const onRestoreMeta = useCallback(() => onRestoreMetadata(dataRef), [dataRef, onRestoreMetadata]);

	const toggleEditing = useCallback(() => {
		if (isEditing) { // reset name upon blur
			setDataFile(options.find(o => o.id === dataRef.value));
		}
		setIsEditing(!isEditing);
	}, [setIsEditing, isEditing, dataRef, setDataFile, options]);

	const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (dataFile.id === dataRef.value) {
			setIsEditing(false);
		} else {
			onUpdate(dataRef, dataFile);
		}
	}, [dataFile, dataRef, onUpdate, setIsEditing]);

	const onClearDataRef = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onClear(dataRef);
	}, [onClear, dataRef]);

	const onBlur = useCallback(() => setShowDropDown(false), [setShowDropDown]);
	const onFocus = useCallback(() => setShowDropDown(true), [setShowDropDown]);
	const onKeyDown = useCallback(() => setIsEditing(false), [setIsEditing]);

	const onChange = useCallback((value: string) => {
		setDataFile(options.find(o => o.id === value));
	}, [options, setDataFile]);

	useEffect(() => {
		setDataFile(options.find(o => o.id === dataRef.value));
		setIsEditing(false);
	}, [dataRef, options, setDataFile, setIsEditing]);

	return (
		<Table.Tr>
			{
				showMetaEditor ? (
					<MetaEditorModal
						onClose={ closeMetaEditor }
						onRestore={ onRestoreMeta }
						onSaveMeta={ onSaveMeta }
						meta={ dataRef.metaString }
						name={ dataRef.name }
						scope={ MetadataScope.DataRef }
					/>
				) : null
			}
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ dataRef.name }
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
							<Menu.Item leftSection={ <IconElement path={ mdiCodeBraces } /> } onClick={ toggleMetaEditor }>
								Edit Metadata
							</Menu.Item>
							<Menu.Divider />
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
