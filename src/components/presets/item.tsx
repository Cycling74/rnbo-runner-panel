import { FunctionComponent, MouseEvent, memo, useCallback } from "react";
import { ActionIcon, Group, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import classes from "./presets.module.css";
import { PresetRecord } from "../../models/preset";

export type PresetItemProps = {
	preset: PresetRecord;
	onDelete: (set: PresetRecord) => any;
	onLoad: (set: PresetRecord) => any;
};

export const PresetItem: FunctionComponent<PresetItemProps> = memo(function WrappedPresetItem({
	preset,
	onDelete,
	onLoad
}: PresetItemProps) {

	const onLoadPreset = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onLoad(preset);
	}, [onLoad, preset]);

	const onDeletePreset = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onDelete(preset);
	}, [onDelete, preset]);

	return (
		<Group>
			<TextInput className={ classes.presetItemName } readOnly variant="unstyled" value={ preset.name } size="sm" />
			<ActionIcon.Group>
				<ActionIcon variant="subtle" color="red" size="md" onClick={ onDeletePreset } >
					<FontAwesomeIcon icon={ faTrash } />
				</ActionIcon>
				<ActionIcon variant="subtle" size="md" onClick={ onLoadPreset } >
					<FontAwesomeIcon icon={ faRotateRight } />
				</ActionIcon>
			</ActionIcon.Group>
		</Group>
	);
});
