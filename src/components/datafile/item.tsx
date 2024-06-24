import { ActionIcon, Group, Table, Text } from "@mantine/core";
import { DataFileRecord } from "../../models/datafile";
import { FC, memo, useCallback } from "react";
import { IconElement } from "../elements/icon";
import { mdiTrashCan } from "@mdi/js";

export type DataFileListItemProps = {
	dataFile: DataFileRecord;
	onDelete: (file: DataFileRecord) => any;
};

export const DataFileListItem: FC<DataFileListItemProps> = memo(function WrappedDataFileListItem({
	dataFile,
	onDelete
}) {

	const onTriggerDelete = useCallback(() => {
		onDelete(dataFile);
	}, [onDelete, dataFile]);

	return (
		<Table.Tr>
			<Table.Td>
				<Text fz="sm" truncate="end">
					{ dataFile.fileName }
				</Text>
			</Table.Td>
			<Table.Td>
				<Group justify="flex-end">
					<ActionIcon color="red" variant="outline" onClick={ onTriggerDelete } >
						<IconElement path={ mdiTrashCan } />
					</ActionIcon>
				</Group>
			</Table.Td>
		</Table.Tr>
	);
});
