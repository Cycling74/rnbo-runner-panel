import { ActionIcon, Menu, Table, Text } from "@mantine/core";
import { DataFileRecord } from "../../models/datafile";
import { FC, memo, useCallback } from "react";
import { IconElement } from "../elements/icon";
import { mdiDotsVertical, mdiTrashCan } from "@mdi/js";

export type DataFileListItemProps = {
	dataFile: DataFileRecord;
	onDelete: (file: DataFileRecord) => any;
};

export const DataFileListItem: FC<DataFileListItemProps> = memo(function WrappedDataFileListItem({
	dataFile,
	onDelete
}) {

	const onTriggerDelete = useCallback(() => onDelete(dataFile), [onDelete, dataFile]);
	return (
		<Table.Tr>
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ dataFile.fileName }
				</Text>
			</Table.Td>
			<Table.Td ta="center">
				<Menu position="bottom-end" >
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray" size="md">
							<IconElement path={ mdiDotsVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Audio File</Menu.Label>
						<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan }/> } onClick={ onTriggerDelete } >Delete</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Table.Td>
		</Table.Tr>
	);
});
