import { ChangeEvent, FormEvent, FunctionComponent, KeyboardEvent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { GraphSetRecord } from "../../models/set";
import { ActionIcon, Group, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faPen, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import classes from "./sets.module.css";

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
		onRename(set, name);
	}, [name, onRename, set]);

	const onLoadSet = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onLoad(set);
	}, [onLoad, set]);

	const onDeleteSet = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		onDelete(set);
	}, [onDelete, set]);

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
	}, [setName]);

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			toggleEditing();
		}
	}, [toggleEditing]);

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isEditing, inputRef]);

	useEffect(() => {
		setName(set.name);
		setIsEditing(false);
	}, [set, setName, setIsEditing]);

	return isEditing ? (
		<form onSubmit={ onRenameSet } >
			<Group>
				<TextInput
					className={ classes.setItemName }
					onChange={ onChange }
					onKeyDown={ onKeyDown }
					ref={ inputRef }
					size="sm"
					value={ name }
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
