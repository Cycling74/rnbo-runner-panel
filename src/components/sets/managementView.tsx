import { Group, Stack, Table } from "@mantine/core";
import { FC, memo, useCallback, useState } from "react";
import { GraphSetItem } from "./item";
import { GraphSetRecord } from "../../models/set";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { SortOrder } from "../../lib/constants";
import { getCurrentGraphSetId, getGraphSetsSortedByName } from "../../selectors/sets";
import { SearchInput } from "../page/searchInput";
import { destroyGraphSetOnRemote, loadGraphSetOnRemote, overwriteGraphSetOnRemote, renameGraphSetOnRemote } from "../../actions/sets";

const SetManagementView: FC = memo(function WrappedSetsView() {

	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);
	const [searchValue, setSearchValue] = useState<string>("");
	const dispatch = useAppDispatch();

	const [
		sets,
		currentSetId
	] = useAppSelector((state: RootStateType) => [
		getGraphSetsSortedByName(state, sortOrder, searchValue),
		getCurrentGraphSetId(state)
	]);

	const onToggleSort = useCallback(() => {
		setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);
	}, [setSortOrder, sortOrder]);

	const onDeleteSet = useCallback((set: GraphSetRecord) => {
		dispatch(destroyGraphSetOnRemote(set));
	}, [dispatch]);

	const onRenameSet = useCallback((set: GraphSetRecord, name: string): void => {
		dispatch(renameGraphSetOnRemote(set, name));
	}, [dispatch]);

	const onLoadSet = useCallback((set: GraphSetRecord) => {
		dispatch(loadGraphSetOnRemote(set));
	}, [dispatch]);

	const onOverwriteSet = useCallback((set: GraphSetRecord) => {
		dispatch(overwriteGraphSetOnRemote(set));
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
							Name
						</TableHeaderCell>
						<Table.Th w={ 40 }></Table.Th>
						<Table.Th w={ 60 }></Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{
						sets.map(set => (
							<GraphSetItem
								key={ set.id }
								set={ set }
								isCurrent={ set.id === currentSetId }
								onRename={ onRenameSet }
								onLoad={ onLoadSet }
								onDelete={ onDeleteSet }
								onOverwrite={ onOverwriteSet }
							/>
						))
					}
				</Table.Tbody>
			</Table>
		</Stack>
	);
});

export default SetManagementView;
