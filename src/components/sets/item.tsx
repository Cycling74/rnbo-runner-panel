import { ChangeEvent, FormEvent, FunctionComponent, KeyboardEvent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { GraphSetRecord } from "../../models/set";
import { ActionIcon, Group, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faPen, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import classes from "./sets.module.css";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";

export type GraphSetItemProps = {
	set: GraphSetRecord;
	onDelete: (set: GraphSetRecord) => any;
	onLoad: (set: GraphSetRecord) => any;
	onRename: (set: GraphSetRecord, name: string) => any;
};

export const GraphSetItem: FunctionComponent<GraphSetItemProps> = memo(function WrappedGraphSet({
	set,
	onDelete,
	onLoad,
	onRename
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
		if (!name?.length) {
			setError("Please provide a valid set name");
		} else {
			onRename(set, name);
		}
	}, [name, onRename, set, setError]);

	const onLoadSet = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onLoad(set);
	}, [onLoad, set]);

	const onDeleteSet = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onDelete(set);
	}, [onDelete, set]);

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
		setName(set.name);
		setIsEditing(false);
	}, [set, setName, setIsEditing]);

	return isEditing ? (
		<form onSubmit={ onRenameSet } >
			<Group align="flex-start">
				<TextInput
					className={ classes.setItemName }
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
			<TextInput className={ classes.setItemName } readOnly variant="unstyled" value={ name } size="sm" />
			<ActionIcon.Group>
				<ActionIcon variant="subtle" color="red" size="md" onClick={ onDeleteSet } >
					<FontAwesomeIcon icon={ faTrash } />
				</ActionIcon>
				<ActionIcon variant="subtle" size="md" color="gray" onClick={ toggleEditing } >
					<FontAwesomeIcon icon={ faPen } />
				</ActionIcon>
				<ActionIcon variant="subtle" size="md" onClick={ onLoadSet } >
					<FontAwesomeIcon icon={ faUpload } />
				</ActionIcon>
			</ActionIcon.Group>
		</Group>
	);
});
