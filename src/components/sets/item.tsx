import { FunctionComponent, MouseEvent, memo, useCallback, useState } from "react";
import { GraphSetRecord } from "../../models/set";
import { ActionIcon, Group, Menu, Table, Tooltip } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiArrowUpBoldBoxOutline, mdiDotsVertical, mdiFileReplaceOutline, mdiPencil, mdiStarBoxOutline, mdiTrashCan } from "@mdi/js";
import { EditableTableTextCell } from "../elements/editableTableCell";

export type GraphSetItemProps = {
	set: GraphSetRecord;
	isCurrent: boolean;
	isInitial: boolean;
	onDelete: (set: GraphSetRecord) => any;
	onLoad: (set: GraphSetRecord) => any;
	onRename: (set: GraphSetRecord, name: string) => any;
	onOverwrite: (set: GraphSetRecord) => any;
};

export const GraphSetItem: FunctionComponent<GraphSetItemProps> = memo(function WrappedGraphSet({
	set,
	isCurrent,
	isInitial,
	onDelete,
	onLoad,
	onRename,
	onOverwrite
}: GraphSetItemProps) {

	const [isEditingName, setIsEditingName] = useState<boolean>(false);

	const onLoadSet = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onLoad(set);
	}, [onLoad, set]);

	const onDeleteSet = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onDelete(set);
	}, [onDelete, set]);

	const onOverwriteSet = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onOverwrite(set);
	}, [onOverwrite, set]);

	const onUpdateName = useCallback((name: string) => {
		onRename(set, name);
	}, [onRename, set]);

	const onTriggerRenameSet = useCallback(() => {
		setIsEditingName(true);
	}, [setIsEditingName]);

	return (
		<Table.Tr>
			<Table.Td>
				<Group gap={ 0 } wrap="nowrap" align="center">
					{
						isCurrent ? (
							<Tooltip label="This graph is currently loaded">
								<IconElement path={ mdiArrowUpBoldBoxOutline } color="green" />
							</Tooltip>
						) : null
					}
					{
						isInitial ? (
							<Tooltip label="This graph is loaded on startup">
								<IconElement path={ mdiStarBoxOutline } color="yellow" />
							</Tooltip>
						) : null
					}
				</Group>
			</Table.Td>
			<EditableTableTextCell
				isEditing={ isEditingName }
				onChangeEditingState={ setIsEditingName }
				name="set_name"
				onUpdate={ onUpdateName }
				value={ set.name }
			/>
			<Table.Td ta="center">
				<Menu position="bottom-end" >
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray">
							<IconElement path={ mdiDotsVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Graph</Menu.Label>
						<Menu.Item leftSection={ <IconElement path={ mdiArrowUpBoldBoxOutline } />} onClick={ onLoadSet }>
							Load
						</Menu.Item>
						<Menu.Divider />
						<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ onTriggerRenameSet } >
							Rename
						</Menu.Item>
						<Menu.Item leftSection={ <IconElement path={ mdiFileReplaceOutline } /> } onClick={ onOverwriteSet } disabled={ isCurrent } >
							Overwrite
						</Menu.Item>
						<Menu.Divider />
						<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onDeleteSet } >
							Delete
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Table.Td>
		</Table.Tr>
	);
});
