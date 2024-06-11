import { FunctionComponent, ChangeEvent, KeyboardEvent, MouseEvent, FormEvent, memo, useCallback, useState, useRef, useEffect } from "react";
import { ActionIcon, Button, Group, Menu, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faEllipsisVertical, faPen, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import classes from "./presets.module.css";
import { PresetRecord } from "../../models/preset";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";

export type PresetItemProps = {
	preset: PresetRecord;
	onDelete: (set: PresetRecord) => any;
	onLoad: (set: PresetRecord) => any;
	onRename: (set: PresetRecord, name: string) => any;
};

export const PresetItem: FunctionComponent<PresetItemProps> = memo(function WrappedPresetItem({
	preset,
	onDelete,
	onLoad,
	onRename
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

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
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
						<FontAwesomeIcon icon={ faClose } />
					</ActionIcon>
					<ActionIcon variant="subtle" size="md" type="submit">
						<FontAwesomeIcon icon={ faCheck } />
					</ActionIcon>
				</ActionIcon.Group>
			</Group>
		</form>
	) : (
		<Group gap="xs">
			<Button
				className={ classes.presetButton }
				color="gray"
				justify="flex-start"
				size="sm"
				variant="outline"
				leftSection={ <FontAwesomeIcon icon={ faUpload } /> }
				onClick={ onLoadPreset }
			>
				{ preset.name }
			</Button>
			<Menu position="bottom-end" >
				<Menu.Target>
					<ActionIcon variant="subtle" color="gray">
						<FontAwesomeIcon icon={ faEllipsisVertical } />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Label>Actions</Menu.Label>
					<Menu.Item leftSection={ <FontAwesomeIcon icon={ faPen } /> } onClick={ toggleEditing } >Rename</Menu.Item>
					<Menu.Item color="red" leftSection={ <FontAwesomeIcon icon={ faTrash } /> } onClick={ onDeletePreset } >Delete</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
});
