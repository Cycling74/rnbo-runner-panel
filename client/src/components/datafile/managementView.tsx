import { FC, memo, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { SortOrder } from "../../lib/constants";
import { RootStateType } from "../../lib/store";
import { getDataFilesSortedByName } from "../../selectors/datafiles";
import { DataFileRecord } from "../../models/datafile";
import { deleteDataFileOnRemote, downloadDataFileFromRunner } from "../../actions/datafiles";
import { Group, Stack, Table } from "@mantine/core";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { DataFileListItem } from "./item";
import { SearchInput } from "../page/searchInput";
import { getRunnerOrigin } from "../../selectors/appStatus";

export const DataFileManagementView: FC = memo(function WrappedDataFileView() {

	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);
	const [searchValue, setSearchValue] = useState<string>("");

	const dispatch = useAppDispatch();
	const [
		origin,
		files
	] = useAppSelector((state: RootStateType) => [
		getRunnerOrigin(state),
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

	return (
		<Stack gap={ 0 } >
			<Group justify="flex-end" wrap="nowrap" gap="xs">
				<SearchInput onSearch={ setSearchValue } />
			</Group>
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
