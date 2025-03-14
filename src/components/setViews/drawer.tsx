import { Map as ImmuMap }from "immutable";
import { Divider, Drawer, Group, Stack } from "@mantine/core";
import { FC, useCallback } from "react";
import { IconElement } from "../elements/icon";
import { mdiTableEye } from "@mdi/js";
import { DrawerSectionTitle } from "../page/drawer";
import { CreateSetViewForm } from "./create";
import { GraphSetViewRecord } from "../../models/set";
import { GraphSetViewItem } from "./item";

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
		onDeleteSetView(setView);
	}, [onDeleteSetView]);

	const validateUniqueSetViewName = useCallback((name: string): boolean => {
		return !setViews.find(v => v.name === name);
	}, [setViews]);

	return (

		<Drawer
			opened={ open }
			onClose={ onClose }
			position="right"
			title={ <Group gap="xs"><IconElement path={ mdiTableEye }/> Parameter Views</Group> }
		>
			<CreateSetViewForm onSave={ onCreateSetView } />
			<Divider mt="lg" />
			<DrawerSectionTitle>Saved Parameter Views</DrawerSectionTitle>
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
							validateUniqueName={ validateUniqueSetViewName }
						/>
					))
				}
			</Stack>
		</Drawer>
	);
};

export default SetViewDrawer;
