import { FunctionComponent, MouseEvent, memo, useCallback, useState } from "react";
import { ActionIcon, Menu, Table } from "@mantine/core";
import { PatcherExportRecord } from "../../models/patcher";
import classes from "./patchers.module.css";
import { IconElement } from "../elements/icon";
import { mdiDotsVertical, mdiDownload, mdiPencil, mdiTrashCan } from "@mdi/js";
import { EditableTableTextCell } from "../elements/editableTableCell";

export type PatcherItemProps = {
	patcher: PatcherExportRecord;
	onDelete: (p: PatcherExportRecord) => void;
	onDownload: (p: PatcherExportRecord) => void;
	onRename: (p: PatcherExportRecord, name: string) => void;
};

export const PatcherItem: FunctionComponent<PatcherItemProps> = memo(function WrappedPatcherItem({
	patcher,
	onDelete,
	onDownload,
	onRename
}: PatcherItemProps) {

	const [isEditingName, setIsEditingName] = useState<boolean>(false);

	const onDeletePatcher = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onDelete(patcher);
	}, [onDelete, patcher]);

	const onUpdateName = useCallback((name: string): void => {
		onRename(patcher, name);
	}, [patcher, onRename]);

	const onTriggerRenamePatcher = useCallback(() => {
		setIsEditingName(true);
	}, [setIsEditingName]);

	const onTriggerDownload = useCallback(() => {
		onDownload(patcher);
	}, [patcher, onDownload]);

	return (
		<Table.Tr className={ classes.patcherItem } >
			<EditableTableTextCell
				isEditing={ isEditingName }
				onChangeEditingState={ setIsEditingName }
				name="patcher_name"
				onUpdate={ onUpdateName }
				value={ patcher.name }
			/>
			<Table.Td>
				{ patcher.createdAt.fromNow() }
			</Table.Td>
			<Table.Td ta="center">
				<Menu position="bottom-end" >
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray" size="md">
							<IconElement path={ mdiDotsVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Patcher</Menu.Label>
						<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ onTriggerRenamePatcher } >Rename</Menu.Item>
						<Menu.Item  leftSection={ <IconElement path={ mdiDownload }/> } onClick={ onTriggerDownload } >Download</Menu.Item>
						<Menu.Divider />
						<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan }/> } onClick={ onDeletePatcher } >Delete</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Table.Td>
		</Table.Tr>
	);
});
