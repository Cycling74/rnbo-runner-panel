import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { SortOrder } from "../../lib/constants";
import { RootStateType } from "../../lib/store";
import { getDataFilesSortedByName } from "../../selectors/datafiles";
import { DataFileRecord } from "../../models/datafile";
import { deleteDataDirOnRemote, deleteDataFileOnRemote, downloadDataFileFromRunner } from "../../actions/datafiles";
import { ActionIcon, Group, Menu, RenderTreeNodePayload, Stack, Table, Text, Tree, TreeNodeData, useTree } from "@mantine/core";
import classes from "./datafile.module.css";
import { SearchInput } from "../page/searchInput";
import { IconElement } from "../elements/icon";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { mdiChevronDown, mdiChevronRight, mdiDotsVertical, mdiDownload, mdiFolder, mdiTrashCan, mdiUpload } from "@mdi/js";

function sortNodes(nodes: TreeNodeData[], order: SortOrder): TreeNodeData[] {
	const dir = order === SortOrder.Asc ? 1 : -1;
	return nodes.sort((a, b) => {
		const aIsDir = a.children !== undefined;
		const bIsDir = b.children !== undefined;
		if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
		return (a.label as string).localeCompare(b.label as string) * dir;
	}).map(node => node.children ? { ...node, children: sortNodes(node.children, order) } : node);
}

function buildTreeData(files: DataFileRecord[], order: SortOrder): TreeNodeData[] {
	const dirMap = new Map<string, TreeNodeData>();
	const root: TreeNodeData[] = [];

	for (const file of files) {
		const parts = file.path.split("/");
		const leafNode: TreeNodeData = file.isDir
			? { value: file.id, label: file.fileName, children: [] }
			: { value: file.id, label: file.fileName };

		if (parts.length === 1) {
			root.push(leafNode);
		} else {
			let children: TreeNodeData[] = root;
			for (let i = 0; i < parts.length - 1; i++) {
				const dirPath = parts.slice(0, i + 1).join("/");
				let dirNode = dirMap.get(dirPath);
				if (!dirNode) {
					dirNode = { value: dirPath, label: parts[i], children: [] };
					dirMap.set(dirPath, dirNode);
					children.push(dirNode);
				}
				children = dirNode.children!;
			}
			children.push(leafNode);
		}
	}

	return sortNodes(root, order);
}

function collectDirValues(nodes: TreeNodeData[]): string[] {
	return nodes.flatMap(node =>
		node.children !== undefined
			? [node.value, ...collectDirValues(node.children)]
			: []
	);
}

export type DataFileManagementViewProps = {
	onRequestUpload?: (path: string) => void;
};

export const DataFileManagementView: FC<DataFileManagementViewProps> = memo(function WrappedDataFileView({ onRequestUpload }) {

	const [searchValue, setSearchValue] = useState<string>("");
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);

	const dispatch = useAppDispatch();
	const [files] = useAppSelector((state: RootStateType) => [
		getDataFilesSortedByName(state, sortOrder, searchValue)
	]);

	const onToggleSort = useCallback(() => {
		setSortOrder(o => o === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);
	}, []);

	const tree = useTree();
	const treeData = useMemo(() => buildTreeData(files.toArray(), sortOrder), [files, sortOrder]);

	const prevSearchRef = useRef(searchValue);
	useEffect(() => {
		const prevSearch = prevSearchRef.current;
		prevSearchRef.current = searchValue;
		if (searchValue) {
			tree.setExpandedState(Object.fromEntries(collectDirValues(treeData).map(v => [v, true])));
		} else if (prevSearch !== searchValue) {
			tree.setExpandedState({});
		}
	}, [searchValue, treeData]);

	const onDeleteFile = useCallback((file: DataFileRecord) => {
		dispatch(deleteDataFileOnRemote(file));
	}, [dispatch]);

	const onDownloadFile = useCallback((file: DataFileRecord) => {
		dispatch(downloadDataFileFromRunner(file));
	}, [dispatch]);

	const onDeleteDir = useCallback((dirPath: string, dirName: string) => {
		dispatch(deleteDataDirOnRemote(dirPath, dirName));
	}, [dispatch]);

	const renderNode = useCallback(({ node, expanded, hasChildren, elementProps, level }: RenderTreeNodePayload) => {
		const nodeStyle = {
			paddingLeft: `calc(var(--mantine-spacing-xs) + ${level * 20}px)`,
			paddingRight: "var(--mantine-spacing-xs)",
			borderBottom: "1px solid var(--mantine-color-default-border)"
		};
		if (node.children !== undefined) {
			return (
				<Group { ...elementProps } className={ classes.treeRow } justify="space-between" wrap="nowrap" w="100%" py="xs" style={ nodeStyle }>
					<Group wrap="nowrap" gap={ 4 }>
						{ hasChildren
							? <IconElement path={ expanded ? mdiChevronDown : mdiChevronRight } size={ 0.8 } />
							: <span style={{ display: "inline-block", width: "0.8em" }} />
						}
						<IconElement path={ mdiFolder } size={ 0.9 } />
						<Text fz="sm" fw={ 500 }>{ node.label as string }</Text>
					</Group>
					<Menu position="bottom-end">
						<Menu.Target>
							<ActionIcon
								variant="subtle"
								color="gray"
								size="md"
								onClick={ (e) => e.stopPropagation() }
							>
								<IconElement path={ mdiDotsVertical } />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>Directory</Menu.Label>
							{ onRequestUpload
								? <Menu.Item leftSection={ <IconElement path={ mdiUpload } /> } onClick={ (e) => { e.stopPropagation(); onRequestUpload(node.value); } }>Upload here</Menu.Item>
								: null
							}
							<Menu.Divider />
							<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ (e) => { e.stopPropagation(); onDeleteDir(node.value, node.label as string); } }>Delete</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			);
		}

		const file = files.find(f => f.id === node.value);
		if (!file) return null;

		return (
			<Group { ...elementProps } className={ classes.treeRow } justify="space-between" wrap="nowrap" w="100%" py="sm" style={ nodeStyle }>
				<Text fz="sm" truncate="end" style={{ flex: 1, minWidth: 0 }}>
					{ file.fileName }
				</Text>
				<Menu position="bottom-end">
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray" size="md">
							<IconElement path={ mdiDotsVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Data File</Menu.Label>
						<Menu.Item leftSection={ <IconElement path={ mdiDownload } /> } onClick={ () => onDownloadFile(file) }>Download</Menu.Item>
						<Menu.Divider />
						<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ () => onDeleteFile(file) }>Delete</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		);
	}, [files, onDeleteFile, onDownloadFile, onDeleteDir, onRequestUpload]);

	return (
		<Stack gap={ 0 } >
			<Group justify="flex-end" wrap="nowrap" gap="xs">
				<SearchInput onSearch={ setSearchValue } />
			</Group>
			<Table maw="100%" layout="fixed">
				<Table.Thead>
					<Table.Tr>
						<TableHeaderCell onSort={ onToggleSort } sortKey="filename" sortOrder={ sortOrder } sorted>Filename</TableHeaderCell>
						<Table.Th w={ 60 }></Table.Th>
					</Table.Tr>
				</Table.Thead>
			</Table>
			<Tree data={ treeData } renderNode={ renderNode } levelOffset={ 0 } tree={ tree } />
		</Stack>
	);
});
