import { Button, Divider, Drawer, Flex, Group, Stack } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { PresetItem } from "./item";
import { PresetRecord } from "../../models/preset";
import { Seq } from "immutable";
import { IconElement } from "../elements/icon";
import { mdiCamera, mdiPlus } from "@mdi/js";
import styles from "./presets.module.css";

export type PresetDrawerProps = {
	open: boolean;
	onClose: () => any;
	onDeletePreset: (preset: PresetRecord) => any;
	onLoadPreset: (preset: PresetRecord) => any;
	onCreatePreset: () => any;
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
		<Drawer.Root opened={ open } onClose={ onClose } position="right">
			<Drawer.Overlay />
			<Drawer.Content>
				<Flex direction="column" style={{ height: "100%" }}>
					<Drawer.Header>
						<Drawer.Title>
							<Group gap="xs">
								<IconElement path={ mdiCamera } />
								Presets
							</Group>
						</Drawer.Title>
						<Drawer.CloseButton />
					</Drawer.Header>
					<Drawer.Body style={{ flex: 1 }} >
						<Flex direction="column" style={{ height: "100%" }} gap="lg" >
							<Flex className={ styles.presetListWrapper } direction="column">
								<Stack gap="sm" >
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
							</Flex>
							<Divider />
							<Button variant="outline" leftSection={ <IconElement path={ mdiPlus } /> } fullWidth={ true } onClick={ onCreatePreset } >
								Create Preset
							</Button>
						</Flex>
					</Drawer.Body>
				</Flex>
			</Drawer.Content>
		</Drawer.Root>
	);
});

export default PresetDrawer;


