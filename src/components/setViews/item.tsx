import { ChangeEvent, KeyboardEvent, MouseEvent, FormEvent, memo, useCallback, useState, useRef, useEffect, FC, FocusEvent } from "react";
import { ActionIcon, Button, Group, Menu, TextInput, Tooltip } from "@mantine/core";
import classes from "./setviews.module.css";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";
import { IconElement } from "../elements/icon";
import { mdiArrowUpBoldBoxOutline, mdiCheck, mdiClose, mdiDotsVertical, mdiPencil, mdiTrashCan } from "@mdi/js";
import { GraphSetViewRecord } from "../../models/set";
import { v4 } from "uuid";

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
	const [submitId] = useState<string>(v4());
	const [error, setError] = useState<string | undefined>(undefined);
	const [name, setName] = useState<string>(setView.name);
	const inputRef = useRef<HTMLInputElement>();

	const enableEditing = useCallback(() => setIsEditing(true), [setIsEditing]);

	const onLoadSetView = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onLoad(setView);
	}, [onLoad, setView]);

	const onRenameSetView = useCallback(() => {
		inputRef.current?.focus();
		const trimmedName = name.trim();
		if (setView.name === trimmedName) {
			setIsEditing(false);
		} else if (!trimmedName?.length) {
			setError("Please provide a valid name");
		} else if (!validateUniqueName(trimmedName)) {
			setError(`A parameter view with the name "${trimmedName}" already exists`);
		} else {
			onRename(setView, trimmedName);
		}
	}, [name, onRename, setView, setError, setIsEditing, validateUniqueName]);

	const onDeleteSetView = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onDelete(setView);
	}, [onDelete, setView]);

	const onBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
		if (e.relatedTarget?.id === submitId) {
			onRenameSetView();
		} else {
			setIsEditing(false);
		}
	}, [submitId, onRenameSetView]);

	const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onRenameSetView();
	}, [onRenameSetView]);

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
			setName(setView.name);
		} else {
			setName(setView.name);
		}
	}, [isEditing, setView, setName, setError]);

	return isEditing ? (
		<form onSubmit={ onSubmit } className={ classes.setViewNameForm } >
			<Group align="center">
				<TextInput
					autoFocus
					className={ classes.setViewNameInput }
					onBlur={ onBlur }
					onChange={ onChange }
					onKeyDown={ onKeyDown }
					ref={ inputRef }
					size="sm"
					value={ name }
					error={ error }
					variant="unstyled"
				/>
				<ActionIcon.Group>
					<ActionIcon variant="subtle" size="md" color="gray">
						<IconElement path={ mdiClose } />
					</ActionIcon>
					<ActionIcon variant="subtle" size="md" type="submit" id={ submitId } >
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
					<Tooltip label="This parameter view is currently active" >
						<IconElement path={ mdiArrowUpBoldBoxOutline } size="xs" color="green" />
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
					<Menu.Label>Parameter View</Menu.Label>
					<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ enableEditing } >Rename</Menu.Item>
					<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan } /> } onClick={ onDeleteSetView } >Delete</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</Group>
	);
});
