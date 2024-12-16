import { Alert, Drawer, Group, Stack, Text } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { Seq } from "immutable";
import { PatcherExportRecord } from "../../models/patcher";
import { PatcherItem } from "./item";
import { modals } from "@mantine/modals";
import { IconElement } from "../elements/icon";
import { mdiFileExport } from "@mdi/js";

export type PatcherDrawerProps = {
	open: boolean;
	onClose: () => any;
	onLoadPatcher: (patcher: PatcherExportRecord) => any;
	onDeletePatcher: (patcher: PatcherExportRecord) => any;
	onRenamePatcher: (patcher: PatcherExportRecord, newName: string) => any;
	patchers: Seq.Indexed<PatcherExportRecord>;
};

const PatcherDrawer: FunctionComponent<PatcherDrawerProps> = memo(function WrappedPatcherDrawer({
	open,
	onClose,
	onLoadPatcher,
	onDeletePatcher,
	onRenamePatcher,
	patchers
}: PatcherDrawerProps) {

	const onTriggerDeletePatcher = useCallback((p: PatcherExportRecord) => {
		modals.openConfirmModal({
			title: "Delete Patcher",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to delete the patcher named { `"${p.name}"` }?
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => onDeletePatcher(p)
		});
	}, [onDeletePatcher]);

	return (
		<Drawer
			opened={ open }
			onClose={ onClose }
			position="left"
			title={ <Group gap="xs"><IconElement path={ mdiFileExport } />Patchers</Group> }
		>
			<Stack gap="sm">
				{
					patchers.size ? patchers.map(patcher => (
						<PatcherItem
							key={ patcher.id }
							patcher={ patcher }
							onLoad={ onLoadPatcher }
							onDelete={ onTriggerDeletePatcher }
							onRename={ onRenamePatcher }
						/>
					)) : (
						<Alert title="No Patch available" variant="light" color="yellow">
							Please export a RNBO patch to load on the runner.
						</Alert>
					)
				}
			</Stack>
		</Drawer>
	);
});

export default PatcherDrawer;
