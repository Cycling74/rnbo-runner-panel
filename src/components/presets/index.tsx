import { Divider, Drawer, Stack, Text } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { PresetItem } from "./item";
import { SavePresetForm } from "./save";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { DrawerSectionTitle } from "../page/drawer";
import { modals } from "@mantine/modals";
import { PresetRecord } from "../../models/preset";
import { Seq } from "immutable";

export type DevicePresetDrawerProps = {
	open: boolean;
	onClose: () => any;
	onDeletePreset: (preset: PresetRecord) => any;
	onLoadPreset: (preset: PresetRecord) => any;
	onSavePreset: (name: string) => any;
	presets: Seq.Indexed<PresetRecord>;
};

const DevicePresetDrawer: FunctionComponent<DevicePresetDrawerProps> = memo(function WrappedDevicePresetDrawer({
	open,
	onClose,
	onDeletePreset,
	onLoadPreset,
	onSavePreset,
	presets
}: DevicePresetDrawerProps) {

	const onTriggerDeletePreset = useCallback((preset: PresetRecord) => {
		modals.openConfirmModal({
			title: "Delete Preset",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to delete the preset named { `"${preset.name}"` }?
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => onDeletePreset(preset)
		});
	}, [onDeletePreset]);

	return (
		<Drawer
			opened={ open }
			onClose={ onClose }
			position="right"
			title={ <span><FontAwesomeIcon icon={ faCamera }/> Presets</span> }
		>
			<SavePresetForm onSave={ onSavePreset } />
			<Divider mt="lg" />
			<DrawerSectionTitle>Presets</DrawerSectionTitle>
			<Stack gap="sm">
				{
					presets.map(preset => <PresetItem key={ preset.id } preset={ preset } onLoad={ onLoadPreset } onDelete={ onTriggerDeletePreset }/> )
				}
			</Stack>
		</Drawer>
	);
});

export default DevicePresetDrawer;
