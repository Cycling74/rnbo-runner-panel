import { FunctionComponent, ChangeEvent, KeyboardEvent, MouseEvent, FormEvent, memo, useCallback, useState, useRef, useEffect, FocusEvent } from "react";
import { ActionIcon, Button, Group, Indicator, Menu, TextInput, Tooltip } from "@mantine/core";
import classes from "./presets.module.css";
import { PresetRecord } from "../../models/preset";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";
import { IconElement } from "../elements/icon";
import { mdiCheck, mdiClose, mdiDotsVertical, mdiFileReplaceOutline, mdiHistory, mdiPencil, mdiStar, mdiTrashCan } from "@mdi/js";
import { v4 } from "uuid";

export type PresetItemProps = {
	preset: PresetRecord;
	onDelete: (preset: PresetRecord) => any;
	onLoad: (preset: PresetRecord) => any;
	onOverwrite: (preset: PresetRecord) => any;
	onRename: (preset: PresetRecord, name: string) => any;
	onSetInitial?: (preset: PresetRecord) => any;
	validateUniqueName: (name: string) => boolean;
};

export const PresetItem: FunctionComponent<PresetItemProps> = memo(function WrappedPresetItem({
	preset,
	onDelete,
	onLoad,
	onOverwrite,
	onRename,
	onSetInitial,
	validateUniqueName
}: PresetItemProps) {

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [submitId] = useState<string>(v4());
	const [error, setError] = useState<string | undefined>(undefined);
	const [name, setName] = useState<string>(preset.name);
	const inputRef = useRef<HTMLInputElement>();

	const enableEditing = useCallback(() => setIsEditing(true), [setIsEditing]);

	const onSetInitialPreset = useCallback(() => {
		onSetInitial(preset);
	}, [preset, onSetInitial]);

	const onOverwritePreset = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onOverwrite(preset);
	}, [onOverwrite, preset]);

	const onLoadPreset = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onLoad(preset);
	}, [onLoad, preset]);

	const onRenamePreset = useCallback(() => {
		inputRef.current?.focus();
		const trimmedName = name.trim();
		if (preset.name === trimmedName) {
			setIsEditing(false);
		} else if (!trimmedName?.length) {
			setError("Please provide a valid preset name");
		} else if (!validateUniqueName(trimmedName)) {
			setError(`A preset with the name "${trimmedName}" already exists`);
		} else {
			onRename(preset, trimmedName);
		}
	}, [name, onRename, preset, setError, inputRef, setIsEditing, validateUniqueName]);

	const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onRenamePreset();
	}, [onRenamePreset]);

	const onBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
		if (e.relatedTarget?.id === submitId) {
			onRenamePreset();
		} else {
			setIsEditing(false);
		}
	}, [submitId, setIsEditing, onRenamePreset]);

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
			return void setIsEditing(false);
		}

		if (!keyEventIsValidForName(e)) {
			e.preventDefault();
		}
	}, [setIsEditing]);

	useEffect(() => {
		if (!isEditing) {
			setError(undefined);
			setName(preset.name);
		} else {
			setName(preset.name);
		}
	}, [isEditing, setName, setError, preset]);

	return isEditing ? (
		<form onSubmit={ onSubmit } >
			<Group align="flex-start">
				<TextInput
					autoFocus
					className={ classes.presetNameInput }
					onBlur={ onBlur }
					onChange={ onChange }
					onKeyDown={ onKeyDown }
					ref={ inputRef }
					size="sm"
					value={ name }
					error={ error }
					variant="default"
				/>
				<ActionIcon.Group>
					<ActionIcon variant="subtle" size="md" color="gray" >
						<IconElement path={ mdiClose } />
					</ActionIcon>
					<ActionIcon variant="subtle" size="md" type="submit" id={ submitId }>
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
					<Menu.Item leftSection={ <IconElement path={ mdiFileReplaceOutline } /> } onClick={ onOverwritePreset } >Overwrite</Menu.Item>
					<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ enableEditing } >Rename</Menu.Item>
					{ onSetInitial && <Menu.Item leftSection={ <IconElement path={ mdiStar } /> } onClick={ onSetInitialPreset } >Load on Startup</Menu.Item> }
					<Menu.Divider />
					<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onDeletePreset } >Delete</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
});
