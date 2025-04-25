import { FunctionComponent, MouseEvent, memo, useCallback, useEffect, useState } from "react";
import { DataRefRecord } from "../../models/dataref";
import { ActionIcon, Group, Menu, Table, Text } from "@mantine/core";
import { Seq } from "immutable";
import { DataFileRecord } from "../../models/datafile";
import { IconElement } from "../elements/icon";
import { mdiCodeBraces, mdiContentSaveMove, mdiDotsVertical, mdiEraser, mdiPencil } from "@mdi/js";
import { useDisclosure } from "@mantine/hooks";
import { MetadataScope } from "../../lib/constants";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { EditableTableSelectCell } from "../elements/editableTableCell";

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

	const [isEditingFile, setIsEditingFile] = useState<boolean>(false);
	const [dataFile, setDataFile] = useState<DataFileRecord | undefined>(options.find(o => o.id === dataRef.value));

	const [showMetaEditor, { toggle: toggleMetaEditor, close: closeMetaEditor }] = useDisclosure();
	const onSaveMeta = useCallback((meta: string) => onSaveMetadata(dataRef, meta), [dataRef, onSaveMetadata]);
	const onRestoreMeta = useCallback(() => onRestoreMetadata(dataRef), [dataRef, onRestoreMetadata]);

	const toggleEditing = useCallback(() => {
		if (isEditingFile) { // reset name upon blur
			setDataFile(options.find(o => o.id === dataRef.value));
		}
		setIsEditingFile(!isEditingFile);
	}, [setIsEditingFile, isEditingFile, dataRef, setDataFile, options]);

	const onUpdateFile = useCallback((fileId: DataFileRecord["id"]) => {
		const dataFile = options.find(df => df.id === fileId);
		if (!dataFile || dataFile.id === dataRef.value) return;
		onUpdate(dataRef, dataFile);
	}, [dataFile, dataRef, onUpdate, setIsEditingFile]);

	const onClearDataRef = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onClear(dataRef);
	}, [onClear, dataRef]);


	useEffect(() => {
		setDataFile(options.find(o => o.id === dataRef.value));
		setIsEditingFile(false);
	}, [dataRef, options, setDataFile, setIsEditingFile]);

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
			<EditableTableSelectCell
				isEditing={ isEditingFile }
				name={ `${dataRef.name}.file` }
				onChangeEditingState={ setIsEditingFile }
				onUpdate={ onUpdateFile }
				options={ options.toArray().map(f => ({ value: f.id, label: f.fileName })) }
				placeholder="No File Selected"
				value={ dataFile?.id }
			/>
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
