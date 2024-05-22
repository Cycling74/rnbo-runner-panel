import { FunctionComponent, ChangeEvent, KeyboardEvent, MouseEvent, FormEvent, memo, useCallback, useState, useRef, useEffect } from "react";
import { ActionIcon, Group, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faPen, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
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
					className={ classes.presetItemName }
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
		<Group>
			<TextInput className={ classes.presetItemName } readOnly variant="unstyled" value={ preset.name } size="sm" />
			<ActionIcon.Group>
				<ActionIcon variant="subtle" color="red" size="md" onClick={ onDeletePreset } >
					<FontAwesomeIcon icon={ faTrash } />
				</ActionIcon>
				<ActionIcon variant="subtle" size="md" color="gray" onClick={ toggleEditing } >
					<FontAwesomeIcon icon={ faPen } />
				</ActionIcon>
				<ActionIcon variant="subtle" size="md" onClick={ onLoadPreset } >
					<FontAwesomeIcon icon={ faUpload } />
				</ActionIcon>
			</ActionIcon.Group>
		</Group>
	);
});
