import { ActionIcon, Group, Table, Text, TextInput } from "@mantine/core";
import { ChangeEvent, FC, FocusEvent, FormEvent, KeyboardEvent, memo, useCallback, useEffect, useState } from "react";
import classes from "./elements.module.css";
import { IconElement } from "./icon";
import { mdiCheck, mdiClose } from "@mdi/js";
import { v4 } from "uuid";

export type EditableTableTextCellProps = {
	className?: string;
	isEditing: boolean;
	name: string;
	onChangeEditingState: (open: boolean) => void;
	onUpdate: (val: string) => void;
	value: string;
};

export const EditableTableTextCell: FC<EditableTableTextCellProps> = memo(function WrappedEditableTextField({
	className = "",
	isEditing,
	name,
	onChangeEditingState,
	onUpdate,
	value
}) {

	const [currentValue, setCurrentValue] = useState<string>(value);
	const [submitId] = useState<string>(v4());

	const onTriggerEdit = useCallback(() => {
		if (isEditing) return;
		onChangeEditingState(true);
		setCurrentValue(value);
	}, [isEditing, onChangeEditingState, setCurrentValue, value]);

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setCurrentValue(e.target.value);
	}, [setCurrentValue]);

	const onSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (currentValue !== value) onUpdate(currentValue);
		onChangeEditingState(false);
	}, [onChangeEditingState, currentValue, value, onUpdate]);

	const onBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
		if (e.relatedTarget?.id === submitId && currentValue !== value) {
			onUpdate(currentValue);
		} else {
			setCurrentValue(value);
		}
		onChangeEditingState(false);
	}, [submitId, setCurrentValue, currentValue, value, onChangeEditingState, onUpdate]);

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === "Escape") {
			onChangeEditingState(false);
			setCurrentValue(value);
			return void e.preventDefault();
		}
	}, [onChangeEditingState, setCurrentValue, value]);

	useEffect(() => {
		setCurrentValue(value);
	}, [isEditing, value, setCurrentValue]);

	return (
		<Table.Td className={ className } onClick={ onTriggerEdit } py={ 0 } >
			{
				isEditing ? (
					<form  onSubmit={ onSubmit }>
						<Group wrap="nowrap" gap="xs" >
							<TextInput
								autoFocus
								classNames={{
									root: classes.editableTableCellInputWrapper,
									input: classes.editableTableCellInput
								}}
								variant="unstyled"
								onBlur={ onBlur }
								onChange={ onChange }
								onKeyDown={ onKeyDown }
								name={ name }
								size="sm"
								value={ currentValue }
							/>
							<ActionIcon.Group>
								<ActionIcon variant="subtle" size="md" color="gray" >
									<IconElement path={ mdiClose } />
								</ActionIcon>
								<ActionIcon variant="subtle" size="md" type="submit" id={ submitId } >
									<IconElement path={ mdiCheck } />
								</ActionIcon>
							</ActionIcon.Group>
						</Group>
					</form>
				) : (
					<Text truncate="end" fz="sm" >{ value }</Text>
				)
			}

		</Table.Td>
	);
});
