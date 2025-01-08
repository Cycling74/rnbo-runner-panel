import { ChangeEvent, KeyboardEvent, MouseEvent, FormEvent, memo, useCallback, useState, useRef, useEffect, FC } from "react";
import { ActionIcon, Button, Group, Menu, TextInput, Tooltip } from "@mantine/core";
import classes from "./setviews.module.css";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";
import { IconElement } from "../elements/icon";
import { mdiCheck, mdiClose, mdiDotsVertical, mdiPencil, mdiTrashCan } from "@mdi/js";
import { GraphSetViewRecord } from "../../models/set";

export type GraphSetViewItemProps = {
	isActive: boolean;
	onDelete: (set: GraphSetViewRecord) => any;
	onLoad: (set: GraphSetViewRecord) => any;
	onRename: (set: GraphSetViewRecord, name: string) => any;
	setView: GraphSetViewRecord;
	validateUniqueName: (name: string) => boolean;
};

export const GraphSetViewItem: FC<GraphSetViewItemProps> = memo(function WrappedGraphSetViewItem({
	isActive,
	onDelete,
	onLoad,
	onRename,
	setView,
	validateUniqueName
}: GraphSetViewItemProps) {

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [name, setName] = useState<string>(setView.name);
	const inputRef = useRef<HTMLInputElement>();

	const toggleEditing = useCallback(() => {
		if (isEditing) { // reset name upon blur
			setName(setView.name);
		}
		setIsEditing(!isEditing);
	}, [setIsEditing, isEditing, setView, setName]);

	const onLoadSetView = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onLoad(setView);
	}, [onLoad, setView]);

	const onRenameSetView = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		inputRef.current?.focus();
		if (setView.name === name) {
			setIsEditing(false);
		} else if (!name?.length) {
			setError("Please provide a valid SetView name");
		} else if (!validateUniqueName(name)) {
			setError(`A SetView with the name "${name}" already exists`);
		} else {
			onRename(setView, name);
		}
	}, [name, onRename, setView, setError, setIsEditing, validateUniqueName]);

	const onDeleteSetView = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onDelete(setView);
	}, [onDelete, setView]);

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
		setName(setView.name);
		setIsEditing(false);
	}, [setView, setName, setIsEditing]);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
		if (!isEditing) {
			setError(undefined);
		}
	}, [isEditing, inputRef, setError]);

	return isEditing ? (
		<form onSubmit={ onRenameSetView } >
			<Group align="flex-start">
				<TextInput
					className={ classes.setViewNameInput }
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
				fullWidth
				className={ classes.setViewButton }
				justify="flex-start"
				size="sm"
				leftSection={ isActive ? (
					<Tooltip label="This view is currently active" >
						<IconElement path={ mdiCheck } size="xs" color="green" />
					</Tooltip>
				) : null }
				variant="default"
				onClick={ onLoadSetView }
			>
				{ setView.name }
			</Button>
			<Menu position="bottom-end" >
				<Menu.Target>
					<ActionIcon variant="subtle" color="gray">
						<IconElement path={ mdiDotsVertical } />
					</ActionIcon>
				</Menu.Target>
				<Menu.Dropdown>
					<Menu.Label>SetView Actions</Menu.Label>
					<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ toggleEditing } >Rename</Menu.Item>
					<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onDeleteSetView } >Delete</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
});
