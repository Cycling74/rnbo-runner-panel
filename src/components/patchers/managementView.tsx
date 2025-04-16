import { Alert, Anchor, Group, Stack, Table } from "@mantine/core";
import { FC, memo, useCallback, useState } from "react";
import { PatcherSortAttr, SortOrder } from "../../lib/constants";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { getHasPatcherExports, getSortedPatcherExports } from "../../selectors/patchers";
import { RootStateType } from "../../lib/store";
import { destroyPatcherOnRemote, renamePatcherOnRemote } from "../../actions/patchers";
import { PatcherExportRecord } from "../../models/patcher";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { PatcherItem } from "./item";
import { SearchInput } from "../page/searchInput";

export const PatcherManagementView: FC = memo(function WrappedPatcherView() {

	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);
	const [sortAttr, setSortAttr] = useState<PatcherSortAttr>(PatcherSortAttr.Name);
	const [searchValue, setSearchValue] = useState<string>("");
	const dispatch = useAppDispatch();

	const [
		hasPatchers,
		patchers
	] = useAppSelector((state: RootStateType) => [
		getHasPatcherExports(state),
		getSortedPatcherExports(state, sortAttr, sortOrder, searchValue)
	]);

	const onSort = useCallback((attr: PatcherSortAttr): void => {
		if (attr === sortAttr) return void setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);

		setSortAttr(attr);
		setSortOrder(SortOrder.Asc);

	}, [sortOrder, sortAttr, setSortOrder, setSortAttr]);

	const onDeletePatcher = useCallback((patcher: PatcherExportRecord) => {
		dispatch(destroyPatcherOnRemote(patcher));
	}, [dispatch]);

	const onRenamePatcher = useCallback((patcher: PatcherExportRecord, newName: string) => {
		dispatch(renamePatcherOnRemote(patcher, newName));
	}, [dispatch]);

	if (!hasPatchers) {
		return (
			<Alert title="No Patchers available" variant="light" color="yellow">
				Please <Anchor inherit target="_blank" href="https://rnbo.cycling74.com/learn/export-targets-overview">export a RNBO patcher</Anchor> to load on the runner.
			</Alert>
		);
	}

	return (
		<Stack gap={ 0 } >
			<Group justify="flex-end" wrap="nowrap" gap="xs">
				<SearchInput onSearch={ setSearchValue } />
			</Group>
			<Table verticalSpacing="sm" maw="100%" layout="fixed" highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<TableHeaderCell onSort={ onSort } sortKey={ PatcherSortAttr.Name } sortOrder={ sortOrder } sorted={ sortAttr === PatcherSortAttr.Name } >
							Name
						</TableHeaderCell>
						<TableHeaderCell onSort={ onSort } sortKey={ PatcherSortAttr.Date } sortOrder={ sortOrder } sorted={ sortAttr === PatcherSortAttr.Date } width={ 100 } >
							Export
						</TableHeaderCell>
						<Table.Th w={ 60 } ></Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{
						patchers.map(p => (
							<PatcherItem
								key={ p.id }
								onDelete={ onDeletePatcher }
								onRename={ onRenamePatcher }
								patcher={ p }
							/>
						))
					}
				</Table.Tbody>
			</Table>
		</Stack>
	);
});
