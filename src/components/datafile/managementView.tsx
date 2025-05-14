import { FC, memo, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { useDisclosure } from "@mantine/hooks";
import { SortOrder } from "../../lib/constants";
import { RootStateType } from "../../lib/store";
import { getDataFilesSortedByName } from "../../selectors/datafiles";
import { DataFileRecord } from "../../models/datafile";
import { deleteDataFileOnRemote, downloadDataFileFromRunner } from "../../actions/datafiles";
import { showNotification } from "../../actions/notifications";
import { DataFileUploadModal, UploadFile } from "./uploadModal";
import { NotificationLevel } from "../../models/notification";
import { ActionIcon, Group, Stack, Table, Tooltip } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiUpload } from "@mdi/js";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { DataFileListItem } from "./item";
import { SearchInput } from "../page/searchInput";

export const DataFileManagementView: FC = memo(function WrappedDataFileView() {

	const [showUploadModal, uploadModalHandlers] = useDisclosure(false);
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);
	const [searchValue, setSearchValue] = useState<string>("");

	const dispatch = useAppDispatch();
	const [files] = useAppSelector((state: RootStateType) => [
		getDataFilesSortedByName(state, sortOrder, searchValue)
	]);

	const onToggleSort = useCallback(() => {
		setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);
	}, [setSortOrder, sortOrder]);

	const onDeleteFile = useCallback((file: DataFileRecord) => {
		dispatch(deleteDataFileOnRemote(file));
	}, [dispatch]);

	const onDownloadFile = useCallback((file: DataFileRecord) => {
		dispatch(downloadDataFileFromRunner(file));
	}, [dispatch]);

	const onFileUploadSuccess = useCallback((files: UploadFile[]) => {
		dispatch(showNotification({ title: "Upload Complete", message: `Successfully uploaded ${files.length === 1 ? files[0].file.name : `${files.length} files`}`, level: NotificationLevel.success }));
		uploadModalHandlers.close();
	}, [uploadModalHandlers, dispatch]);

	return (
		<Stack gap={ 0 } >
			<Group justify="flex-end" wrap="nowrap" gap="xs">
				<SearchInput onSearch={ setSearchValue } />
				<Tooltip label="Upload Files">
					<ActionIcon variant="default" onClick={ uploadModalHandlers.open } >
						<IconElement path={ mdiUpload } />
					</ActionIcon>
				</Tooltip>
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
								onDownload={ onDownloadFile }
							/>
						))
					}
				</Table.Tbody>
			</Table>
		</Stack>
	);
});
