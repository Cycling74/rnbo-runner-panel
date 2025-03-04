import { Alert, Anchor, Group, Stack, Table, Text, Title } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import classes from "../components/datafile/datafile.module.css";
import { SortOrder } from "../lib/constants";
import { useCallback, useState } from "react";
import { TableHeaderCell } from "../components/elements/tableHeaderCell";
import { getPatchersSortedByName } from "../selectors/patchers";
import { PatcherExportRecord } from "../models/patcher";
import { PatcherItem } from "../components/patchers/item";
import { destroyPatcherOnRemote, renamePatcherOnRemote } from "../actions/patchers";
import { modals } from "@mantine/modals";

const Patchers = () => {

	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);

	const dispatch = useAppDispatch();
	const [patchers] = useAppSelector((state: RootStateType) => [
		getPatchersSortedByName(state, sortOrder)
	]);

	const onToggleSort = useCallback(() => {
		setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);
	}, [setSortOrder, sortOrder]);

	const onDeletePatcher = useCallback((patcher: PatcherExportRecord) => {
		modals.openConfirmModal({
			title: "Delete Patcher",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to delete the patcher named { `"${patcher.name}"` }? This action cannot be undone.
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => dispatch(destroyPatcherOnRemote(patcher))
		});
	}, [dispatch]);

	const onRenamePatcher = useCallback((patcher: PatcherExportRecord, newName: string) => {
		dispatch(renamePatcherOnRemote(patcher, newName));
	}, [dispatch]);

	return (
		<Stack className={ classes.dataFileWrap } >
			<Group justify="space-between" wrap="nowrap">
				<div style={{ flex: "1 2 50%" }} >
					<Title size="md" my={ 0 } >
						Patchers
					</Title>
				</div>
			</Group>
			{
				patchers.size === 0 ? (
					<Alert title="No Patcher available" variant="light" color="yellow">
						Please <Anchor inherit target="_blank" href="https://rnbo.cycling74.com/learn/export-targets-overview">export a RNBO patcher</Anchor> to load on the runner.
					</Alert>
				) : (
					<Table verticalSpacing="sm" maw="100%" layout="fixed" highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								<TableHeaderCell onSort={ onToggleSort } sortKey={ "name" } sortOrder={ sortOrder } sorted >
									Name
								</TableHeaderCell>
								<Table.Th w={ 60 }></Table.Th>
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
				)
			}
		</Stack>
	);
};

export default Patchers;
