import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import { FC, memo } from "react";
import { mdiContentSave, mdiContentSaveMove, mdiDotsVertical, mdiGroup, mdiPencil, mdiPlus, mdiReload, mdiTrashCan } from "@mdi/js";
import { IconElement } from "../elements/icon";

export type GraphSetMenuProps = {
	hasLoadedGraph?: boolean;

	onLoadEmptySet: () => void;
	onTriggerLoadSet: () => void;

	onDeleteCurrentSet: () => void;
	onReloadCurrentSet: () => void;
	onSaveCurrentSet: () => void;
	onSaveCurrentSetAs: () => void;
	onTriggerRenameCurrentSet: () => void;
};

export const GraphSetMenu: FC<GraphSetMenuProps> = memo(function WrapedSaveGraphButtton({
	hasLoadedGraph,

	onLoadEmptySet,
	onTriggerLoadSet,

	onDeleteCurrentSet,
	onReloadCurrentSet,
	onSaveCurrentSet,
	onSaveCurrentSetAs,
	onTriggerRenameCurrentSet
}) {

	return (
		<Menu position="bottom-end" >
			<Menu.Target>
				<Tooltip label="Open Graph Menu">
					<ActionIcon variant="default" size="lg" >
						<IconElement path={ mdiDotsVertical } />
					</ActionIcon>
				</Tooltip>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>
					Graph
				</Menu.Label>
				<Menu.Item onClick={ onLoadEmptySet } leftSection={ <IconElement path={ mdiPlus } /> } >
					New Graph
				</Menu.Item>
				<Menu.Item onClick={ onTriggerLoadSet } leftSection={ <IconElement path={ mdiGroup } /> } >
					Load Graph
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item onClick={ onReloadCurrentSet } leftSection={ <IconElement path={ mdiReload } /> } disabled={ !hasLoadedGraph } >
					Reload Graph
				</Menu.Item>
				<Menu.Item onClick={ onTriggerRenameCurrentSet } leftSection={ <IconElement path={ mdiPencil } /> } disabled={ !hasLoadedGraph } >
					Rename Graph
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item onClick={ onSaveCurrentSet } leftSection={ <IconElement path={ mdiContentSave } /> } >
					Save Graph
				</Menu.Item>
				<Menu.Item onClick={ onSaveCurrentSetAs } leftSection={ <IconElement path={ mdiContentSaveMove } /> } >
					Save Graph As...
				</Menu.Item>
				<Menu.Divider />
				<Menu.Item onClick={ onDeleteCurrentSet } leftSection={ <IconElement path={ mdiTrashCan } /> } color="red" disabled={ !hasLoadedGraph } >
					Delete Graph
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
});
