import { FunctionComponent, ChangeEvent, KeyboardEvent, MouseEvent, FormEvent, memo, useCallback, useState, useRef, useEffect } from "react";
import { ActionIcon, Button, Group, Indicator, Menu, TextInput, Tooltip } from "@mantine/core";
import classes from "./presets.module.css";
import { PresetRecord } from "../../models/preset";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";
import { IconElement } from "../elements/icon";
import { mdiCheck, mdiClose, mdiDotsVertical, mdiHistory, mdiPencil, mdiStar, mdiTrashCan } from "@mdi/js";

export type PresetItemProps = {
	preset: PresetRecord;
	onDelete: (set: PresetRecord) => any;
	onLoad: (set: PresetRecord) => any;
	onRename: (set: PresetRecord, name: string) => any;
	onSetInitial?: (set: PresetRecord) => any;
};

export const PresetItem: FunctionComponent<PresetItemProps> = memo(function WrappedPresetItem({
	preset,
	onDelete,
	onLoad,
	onRename,
	onSetInitial
}: PresetItemProps) {

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [name, setName] = useState<string>(preset.name);
	const inputRef = useRef<HTMLInputElement>();

	const toggleEditing = useCallback(() => {
		if (isEditing) { // reset name upon blur
			setName(preset.name);
		}
		setIsEditing(!isEditing);
	}, [setIsEditing, isEditing, preset, setName]);

	const onSetInitialPreset = useCallback(() => {
		onSetInitial(preset);
	}, [preset, onSetInitial]);

	const onLoadPreset = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onLoad(preset);
	}, [onLoad, preset]);

	const onRenamePreset = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name?.length) {
			setError("Please provide a valid preset name");
		} else {
			onRename(preset, name);
		}
	}, [name, onRename, preset, setError]);

	const onDeletePreset = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onDelete(preset);
	}, [onDelete, preset]);

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setName(replaceInvalidNameChars(e.target.value));
		if (error && e.target.value?.length) setError(undefined);
	}, [setName, error, setError]);

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			return void toggleEditing();
		}

		if (!keyEventIsValidForName(e)) {
			e.preventDefault();
		}
	}, [toggleEditing]);

	useEffect(() => {
		setName(preset.name);
		setIsEditing(false);
	}, [preset, setName, setIsEditing]);

	return isEditing ? (
		<form onSubmit={ onRenamePreset } >
			<Group align="flex-start">
				<TextInput
					className={ classes.presetNameInput }
					onChange={ onChange }
					onKeyDown={ onKeyDown }
					ref={ inputRef }
					size="sm"
					value={ name }
					error={ error }
					variant="default"
				/>
				<ActionIcon.Group>
					<ActionIcon variant="subtle" size="md" color="gray" onClick={ toggleEditing } >
						<IconElement path={ mdiClose } />
					</ActionIcon>
					<ActionIcon variant="subtle" size="md" type="submit">
						<IconElement path={ mdiCheck } />
					</ActionIcon>
				</ActionIcon.Group>
			</Group>
		</form>
	) : (
		<Group gap="xs">
			<Indicator
				position="top-end"
				className={ classes.presetButton }
				color="yellow"
				disabled={ !preset.initial }
				label={(
					<Tooltip label="This preset loads on startup" >
						<IconElement path={ mdiStar } size="0.8em" />
					</Tooltip>
				)}
				size={ 18 }
				withBorder
			>
				<Button
					fullWidth
					justify="flex-start"
					size="sm"
					leftSection={ preset?.latest ? (
						<Tooltip label="This preset was loaded last" >
							<IconElement path={ mdiHistory } size="xs" />
						</Tooltip>
					) : null }
					variant="default"
					onClick={ onLoadPreset }
				>
					{ preset.name }
				</Button>
			</Indicator>
			<Menu position="bottom-end" >
				<Menu.Target>
					<ActionIcon variant="subtle" color="gray">
						<IconElement path={ mdiDotsVertical } />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Label>Preset Actions</Menu.Label>
					<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ toggleEditing } >Rename</Menu.Item>
					{ onSetInitial && <Menu.Item leftSection={ <IconElement path={ mdiStar } /> } onClick={ onSetInitialPreset } >Load on Startup</Menu.Item> }
					<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onDeletePreset } >Delete</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
});
