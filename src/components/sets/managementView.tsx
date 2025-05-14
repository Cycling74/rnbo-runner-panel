import { ActionIcon, Group, Stack, Table, Tooltip } from "@mantine/core";
import { FC, memo, useCallback, useState } from "react";
import { GraphSetItem } from "./item";
import { GraphSetRecord } from "../../models/set";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { SortOrder } from "../../lib/constants";
import { getCurrentGraphSetId, getGraphSetsSortedByName, getInitialGraphSet } from "../../selectors/sets";
import { SearchInput } from "../page/searchInput";
import { destroyGraphSetOnRemote, downloadGraphSetFromRemote, loadGraphSetOnRemote, overwriteGraphSetOnRemote, renameGraphSetOnRemote, triggerStartupGraphSetDialog } from "../../actions/sets";
import { IconElement } from "../elements/icon";
import { mdiStarCog } from "@mdi/js";

const SetManagementView: FC = memo(function WrappedSetsView() {

	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);
	const [searchValue, setSearchValue] = useState<string>("");
	const dispatch = useAppDispatch();

	const [
		sets,
		currentSetId,
		initialGraphSet
	] = useAppSelector((state: RootStateType) => [
		getGraphSetsSortedByName(state, sortOrder, searchValue),
		getCurrentGraphSetId(state),
		getInitialGraphSet(state)
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

	const onDownloadSet = useCallback((set: GraphSetRecord) => {
		dispatch(downloadGraphSetFromRemote(set));
	}, [dispatch]);

	const onConfigureStartupSet = useCallback(() => {
		dispatch(triggerStartupGraphSetDialog());
	}, [dispatch]);


	return (
		<Stack gap={ 0 } >
			<Group justify="flex-end" wrap="nowrap" gap="xs">
				<SearchInput onSearch={ setSearchValue } />
				<Tooltip label="Configure Startup Settings">
					<ActionIcon onClick={ onConfigureStartupSet } variant="default" >
						<IconElement path={ mdiStarCog } />
					</ActionIcon>
				</Tooltip>
			</Group>
			<Table verticalSpacing="sm" maw="100%" layout="fixed" highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th w={ 60 }></Table.Th>
						<TableHeaderCell onSort={ onToggleSort } sortKey={ "filename" } sortOrder={ sortOrder } sorted >
							Name
						</TableHeaderCell>
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
								isInitial={ initialGraphSet && initialGraphSet.id === set.id}
								onDelete={ onDeleteSet }
								onDownload={ onDownloadSet }
								onLoad={ onLoadSet }
								onOverwrite={ onOverwriteSet }
								onRename={ onRenameSet }
							/>
						))
					}
				</Table.Tbody>
			</Table>
		</Stack>
	);
});

export default SetManagementView;
