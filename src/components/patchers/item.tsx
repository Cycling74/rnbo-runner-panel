import { ChangeEvent, FocusEvent, FormEvent, FunctionComponent, KeyboardEvent, MouseEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { ActionIcon, Group, Menu, Table, Text, TextInput } from "@mantine/core";
import { PatcherExportRecord } from "../../models/patcher";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";
import classes from "./patchers.module.css";
import { IconElement } from "../elements/icon";
import { mdiCheck, mdiClose, mdiDotsVertical, mdiPencil, mdiTrashCan } from "@mdi/js";

export type PatcherItemProps = {
	patcher: PatcherExportRecord;
	onDelete: (p: PatcherExportRecord) => any;
	onRename: (p: PatcherExportRecord, name: string) => any;
};

export const PatcherItem: FunctionComponent<PatcherItemProps> = memo(function WrappedPatcherItem({
	patcher,
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

	const triggerRename = useCallback((nName: string) => {
		if (patcher.name === nName) {
			// no-op
		} else if (!nName?.length) {
			setError("Please provide a valid patcher name");
		} else {
			onRename(patcher, nName);
		}
		setIsEditing(false);
	}, [setError, patcher, onRename]);

	const onDeletePatcher = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
		onDelete(patcher);
	}, [onDelete, patcher]);

	const onRenamePatcher = useCallback((e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		triggerRename(name);
	}, [name, triggerRename]);

	const onBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
		triggerRename(name);
	}, [name, triggerRename]);

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
			inputRef.current.select();
		}
		if (!isEditing) {
			setError(undefined);
		}
	}, [isEditing, inputRef, setError]);

	useEffect(() => {
		setName(patcher.name);
		setIsEditing(false);
	}, [patcher, setName, setIsEditing]);

	return (
		<Table.Tr className={ classes.patcherItem } >
			<Table.Td>
				{
					isEditing ? (
						<form onSubmit={ onRenamePatcher } >
							<Group align="center" justify="flex-start">
								<TextInput
									classNames={{
										input: classes.patcherItemNameInput,
										root: classes.patcherItemNameInputWrap
									}}
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
									<ActionIcon variant="subtle" size="md" color="gray" onPointerDown={ toggleEditing } >
										<IconElement path={ mdiClose } />
									</ActionIcon>
									<ActionIcon variant="subtle" size="md" type="submit">
										<IconElement path={ mdiCheck } />
									</ActionIcon>
								</ActionIcon.Group>
							</Group>
						</form>
					) : (
						<Text fz="sm" truncate="end" className={ classes.patcherItemName } onClick={ toggleEditing } >
							{ patcher.name }
						</Text>
					)
				}
			</Table.Td>
			<Table.Td>
				<Menu position="bottom-end" >
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray" size="md">
							<IconElement path={ mdiDotsVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Patcher Actions</Menu.Label>
						<Menu.Item leftSection={ <IconElement path={ mdiPencil } /> } onClick={ toggleEditing } >Rename</Menu.Item>
						<Menu.Item color="red" leftSection={ <IconElement path={ mdiTrashCan }/> } onClick={ onDeletePatcher } >Delete</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Table.Td>
		</Table.Tr>
	);
});
