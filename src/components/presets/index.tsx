import { Divider, Drawer, Group, Stack } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { PresetItem } from "./item";
import { SavePresetForm } from "./save";
import { DrawerSectionTitle } from "../page/drawer";
import { PresetRecord } from "../../models/preset";
import { Seq } from "immutable";
import { IconElement } from "../elements/icon";
import { mdiCamera } from "@mdi/js";

export type PresetDrawerProps = {
	open: boolean;
	onClose: () => any;
	onDeletePreset: (preset: PresetRecord) => any;
	onLoadPreset: (preset: PresetRecord) => any;
	onCreatePreset: (name: string) => any;
	onOverwritePreset: (preset: PresetRecord) => any;
	onRenamePreset: (preset: PresetRecord, name: string) => any;
	onSetInitialPreset?: (set: PresetRecord) => any;
	presets: Seq.Indexed<PresetRecord>;
};

const PresetDrawer: FunctionComponent<PresetDrawerProps> = memo(function WrappedPresetDrawer({
	open,
	onClose,
	onCreatePreset,
	onDeletePreset,
	onLoadPreset,
	onOverwritePreset,
	onRenamePreset,
	onSetInitialPreset,
	presets
}: PresetDrawerProps) {

	const onTriggerDeletePreset = useCallback((preset: PresetRecord) => {
		onDeletePreset(preset);
	}, [onDeletePreset]);

	const validateUniquePresetName = useCallback((name: string): boolean => {
		return !presets.find(p => p.name === name);
	}, [presets]);

	return (
		<Drawer
			opened={ open }
			onClose={ onClose }
			position="right"
			title={ <Group gap="xs"><IconElement path={ mdiCamera }/> Presets</Group> }
		>
			<SavePresetForm onSave={ onCreatePreset } />
			<Divider mt="lg" />
			<DrawerSectionTitle>Saved Presets</DrawerSectionTitle>
			<Stack gap="sm">
				{
					presets.map(preset => (
						<PresetItem
							key={ preset.id }
							preset={ preset }
							onLoad={ onLoadPreset }
							onDelete={ onTriggerDeletePreset }
							onRename={ onRenamePreset }
							onOverwrite={ onOverwritePreset }
							onSetInitial = { onSetInitialPreset }
							validateUniqueName={ validateUniquePresetName }
						/>
					))
				}
			</Stack>
		</Drawer>
	);
});

export default PresetDrawer;
