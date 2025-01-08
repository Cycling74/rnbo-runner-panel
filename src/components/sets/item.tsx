import { ChangeEvent, FormEvent, FunctionComponent, KeyboardEvent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { GraphSetRecord } from "../../models/set";
import { ActionIcon, Button, Group, Menu, TextInput, Tooltip } from "@mantine/core";
import classes from "./sets.module.css";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";
import { IconElement } from "../elements/icon";
import { mdiCheck, mdiClose, mdiContentSave, mdiDotsVertical, mdiHistory, mdiPencil, mdiTrashCan } from "@mdi/js";

export type GraphSetItemProps = {
	set: GraphSetRecord;
	onDelete: (set: GraphSetRecord) => any;
	onLoad: (set: GraphSetRecord) => any;
	onRename: (set: GraphSetRecord, name: string) => any;
	onSave: (set: GraphSetRecord) => any;
	validateUniqueName: (name: string) => boolean;
};

export const GraphSetItem: FunctionComponent<GraphSetItemProps> = memo(function WrappedGraphSet({
	set,
	onDelete,
	onLoad,
	onRename,
	onSave,
	validateUniqueName
}: GraphSetItemProps) {

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [name, setName] = useState<string>(set.name);
	const inputRef = useRef<HTMLInputElement>();

	const toggleEditing = useCallback(() => {
		if (isEditing) { // reset name upon blur
			setName(set.name);
		}
		setIsEditing(!isEditing);
	}, [setIsEditing, isEditing, set, setName]);

	const onRenameSet = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		inputRef.current?.focus();
		const trimmedName = name.trim();
		if (set.name === trimmedName) {
			setIsEditing(false);
		} else if (!trimmedName?.length) {
			setError("Please provide a valid set name");
		} else if (!validateUniqueName(trimmedName)) {
			setError((`A set with the name "${trimmedName} already exists"`));
		} else {
			onRename(set, trimmedName);
		}
	}, [name, onRename, set, setError, inputRef, setIsEditing, validateUniqueName]);

	const onLoadSet = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onLoad(set);
	}, [onLoad, set]);

	const onDeleteSet = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onDelete(set);
	}, [onDelete, set]);

	const onSaveSet = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onSave(set);
	}, [onSave, set]);

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
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
		if (!isEditing) {
			setError(undefined);
		}
	}, [isEditing, inputRef, setError]);

	useEffect(() => {
		setName(set.name);
		setIsEditing(false);
	}, [set, setName, setIsEditing]);

	return isEditing ? (
		<form onSubmit={ onRenameSet } >
			<Group align="flex-start">
				<TextInput
					className={ classes.setItemNameInput }
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
			<Button
				className={ classes.setItemButton }
				justify="flex-start"
				size="sm"
				variant="default"
				leftSection={ set?.latest ? (
					<Tooltip label="This set was loaded last" >
						<IconElement path={ mdiHistory } />
					</Tooltip>
				) : null }
				onClick={ onLoadSet }
			>
				{ name }
			</Button>
			<Menu position="bottom-end" >
				<Menu.Target>
					<ActionIcon variant="subtle" color="gray">
						<IconElement path={ mdiDotsVertical } />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Label>Graph Set Actions</Menu.Label>
					<Menu.Item leftSection={ <IconElement path={ mdiContentSave } /> } onClick={ onSaveSet } >Overwrite</Menu.Item>
					<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ toggleEditing } >Rename</Menu.Item>
					<Menu.Divider />
					<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onDeleteSet } >Delete</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
});
