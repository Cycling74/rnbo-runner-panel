import { Map as ImmuMap }from "immutable";
import { Divider, Drawer, Group, Stack, Text } from "@mantine/core";
import { FC, useCallback } from "react";
import { IconElement } from "../elements/icon";
import { mdiKnob } from "@mdi/js";
import { DrawerSectionTitle } from "../page/drawer";
import { CreateSetViewForm } from "./create";
import { GraphSetViewRecord } from "../../models/set";
import { GraphSetViewItem } from "./item";
import { modals } from "@mantine/modals";

export type CreateSetViewModalProps = {
	onClose: () => void;
	open: boolean;

	onCreateSetView: (name: string) => void;
	onDeleteSetView: (setView: GraphSetViewRecord) => void;
	onLoadSetView: (setView: GraphSetViewRecord) => void;
	onRenameSetView: (setView: GraphSetViewRecord, name: string) => void;

	currentSetView?: GraphSetViewRecord;
	setViews: ImmuMap<GraphSetViewRecord["id"], GraphSetViewRecord>;
};

const SetViewDrawer: FC<CreateSetViewModalProps> = ({
	onClose,
	open,
	onCreateSetView,
	onDeleteSetView,
	onLoadSetView,
	onRenameSetView,

	currentSetView,
	setViews
}) => {

	const onTriggerDeleteSetView = useCallback((setView: GraphSetViewRecord) => {
		modals.openConfirmModal({
			title: "Delete SetView",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to delete the view named { `"${setView.name}"` }?
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => onDeleteSetView(setView)
		});
	}, [onDeleteSetView]);

	return (

		<Drawer
			opened={ open }
			onClose={ onClose }
			position="right"
			title={ <Group gap="xs"><IconElement path={ mdiKnob }/> SetViews</Group> }
		>
			<CreateSetViewForm onSave={ onCreateSetView } />
			<Divider mt="lg" />
			<DrawerSectionTitle>Saved SetViews</DrawerSectionTitle>
			<Stack gap="sm">
				{
					setViews.valueSeq().map(v => (
						<GraphSetViewItem
							key={ v.id }
							setView={ v }
							isActive={ v.id === currentSetView?.id }
							onDelete={ onTriggerDeleteSetView }
							onRename={ onRenameSetView }
							onLoad={ onLoadSetView }
						/>
					))
				}
			</Stack>
		</Drawer>
	);
};

export default SetViewDrawer;
