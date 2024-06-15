import { Drawer, Group, Stack } from "@mantine/core";
import { FunctionComponent, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVectorSquare } from "@fortawesome/free-solid-svg-icons";
import { DrawerSectionTitle } from "../page/drawer";
import { Seq } from "immutable";
import { PatcherRecord } from "../../models/patcher";
import { PatcherItem } from "./item";

export type PatcherDrawerProps = {
	open: boolean;
	onClose: () => any;
	onLoadPatcher: (patcher: PatcherRecord) => any;
	patchers: Seq.Indexed<PatcherRecord>;
};

const PatcherDrawer: FunctionComponent<PatcherDrawerProps> = memo(function WrappedPresetDrawer({
	open,
	onClose,
	onLoadPatcher,
	patchers
}: PatcherDrawerProps) {

	return (
		<Drawer
			opened={ open }
			onClose={ onClose }
			position="left"
			title={ <Group gap="xs"><FontAwesomeIcon icon={ faVectorSquare }/> Add Patcher Instance</Group> }
		>
			<DrawerSectionTitle>Patchers</DrawerSectionTitle>
			<Stack gap="sm">
				{
					patchers.map(patcher => (
						<PatcherItem
							key={ patcher.id }
							patcher={ patcher }
							onLoad={ onLoadPatcher } />
					))
				}
								{
					patchers.map(patcher => (
						<PatcherItem
							key={ patcher.id }
							patcher={ patcher }
							onLoad={ onLoadPatcher } />
					))
				}
								{
					patchers.map(patcher => (
						<PatcherItem
							key={ patcher.id }
							patcher={ patcher }
							onLoad={ onLoadPatcher } />
					))
				}
								{
					patchers.map(patcher => (
						<PatcherItem
							key={ patcher.id }
							patcher={ patcher }
							onLoad={ onLoadPatcher } />
					))
				}
			</Stack>
		</Drawer>
	);
});

export default PatcherDrawer;
