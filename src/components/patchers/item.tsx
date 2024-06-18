import { ChangeEvent, FormEvent, FunctionComponent, KeyboardEvent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { ActionIcon, Button, Group, Menu, TextInput } from "@mantine/core";
import { PatcherRecord } from "../../models/patcher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faEllipsisVertical, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";
import classes from "./patchers.module.css";

export type PatcherItemProps = {
	patcher: PatcherRecord;
	onLoad: (p: PatcherRecord) => any;
	onDelete: (p: PatcherRecord) => any;
	onRename: (p: PatcherRecord, name: string) => any;
};

export const PatcherItem: FunctionComponent<PatcherItemProps> = memo(function WrappedPatcherItem({
	patcher,
	onLoad,
	onDelete,
	onRename
}: PatcherItemProps) {

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [name, setName] = useState<string>(patcher.name);
	const inputRef = useRef<HTMLInputElement>();

	const toggleEditing = useCallback(() => {
		if (isEditing) { // reset name upon blur
			setName(patcher.name);
		}
		setIsEditing(!isEditing);
	}, [setIsEditing, isEditing, patcher, setName]);

	const onRenamePatcher = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!name?.length) {
			setError("Please provide a valid patcher name");
		} else {
			onRename(patcher, name);
		}
	}, [name, onRename, patcher, setError]);

	const onDeletePatcher = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onDelete(patcher);
	}, [onDelete, patcher]);

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
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
		if (!isEditing) {
			setError(undefined);
		}
	}, [isEditing, inputRef, setError]);

	useEffect(() => {
		setName(patcher.name);
		setIsEditing(false);
	}, [patcher, setName, setIsEditing]);

	const onLoadPatcher = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onLoad(patcher);
	}, [onLoad, patcher]);

	return isEditing ? (
		<form onSubmit={ onRenamePatcher } >
			<Group align="flex-start">
				<TextInput
					className={ classes.patcherItemNameInput }
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
				className={ classes.patcherItemButton }
				justify="flex-start"
				size="sm"
				variant="default"
				onClick={ onLoadPatcher }
			>
				{ patcher.name }
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
					<Menu.Item color="red" leftSection={ <FontAwesomeIcon icon={ faTrash } /> } onClick={ onDeletePatcher } >Delete</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
});
