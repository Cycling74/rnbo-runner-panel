import { Button, Group, Stack, Table } from "@mantine/core";
import { DataFileListItem } from "../components/datafile/item";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getDataFilesSortedByName } from "../selectors/datafiles";
import classes from "../components/datafile/datafile.module.css";
import { SortOrder } from "../lib/constants";
import { useCallback, useState } from "react";
import { DataFileUploadModal, UploadFile } from "../components/datafile/uploadModal";
import { useDisclosure } from "@mantine/hooks";
import { deleteDataFileOnRemote } from "../actions/datafiles";
import { DataFileRecord } from "../models/datafile";
import { NotificationLevel } from "../models/notification";
import { showNotification } from "../actions/notifications";
import { IconElement } from "../components/elements/icon";
import { mdiUpload } from "@mdi/js";
import { TableHeaderCell } from "../components/elements/tableHeaderCell";

const SampleDependencies = () => {

	const [showUploadModal, uploadModalHandlers] = useDisclosure(false);
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);

	const dispatch = useAppDispatch();
	const [files] = useAppSelector((state: RootStateType) => [
		getDataFilesSortedByName(state, sortOrder)
	]);

	const onToggleSort = useCallback(() => {
		setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);
	}, [setSortOrder, sortOrder]);

	const onDeleteFile = useCallback((file: DataFileRecord) => {
		dispatch(deleteDataFileOnRemote(file));
	}, [dispatch]);

	const onFileUploadSuccess = useCallback((files: UploadFile[]) => {
		dispatch(showNotification({ title: "Upload Complete", message: `Successfully uploaded ${files.length === 1 ? files[0].file.name : `${files.length} files`}`, level: NotificationLevel.success }));
		uploadModalHandlers.close();
	}, [uploadModalHandlers, dispatch]);

	return (
		<Stack className={ classes.dataFileWrap } >
			<Group justify="space-between" wrap="nowrap">
				<Button variant="default" leftSection={ <IconElement path={ mdiUpload } /> } onClick={ uploadModalHandlers.open } >
					Upload Files
				</Button>
			</Group>
			{ showUploadModal ? <DataFileUploadModal maxFileCount={ 10 } onClose={ uploadModalHandlers.close } onUploadSuccess={ onFileUploadSuccess } /> : null }
			<Table verticalSpacing="sm" maw="100%" layout="fixed" highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<TableHeaderCell onSort={ onToggleSort } sortKey={ "filename" } sortOrder={ sortOrder } sorted >
							Filename
						</TableHeaderCell>
						<Table.Th w={ 60 }></Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{
						files.map(f => (
							<DataFileListItem
								key={ f.id }
								dataFile={ f }
								onDelete={ onDeleteFile }
							/>
						))
					}
				</Table.Tbody>

			</Table>
		</Stack>
	);
};

export default SampleDependencies;
