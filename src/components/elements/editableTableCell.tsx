import { NumberInput, Table, TextInput } from "@mantine/core";
import { ChangeEvent, FC, KeyboardEvent, memo, useCallback, useEffect, useState } from "react";
import classes from "./elements.module.css";

export type EditableTableNumberCellProps = {
	className?: string;
	min: number;
	max: number;
	name: string;
	onUpdate: (val: number) => void;
	prefix?: string;
	value: number;
};

export const EditableTableNumberCell: FC<EditableTableNumberCellProps> = memo(function WrappedEditableNumberField({
	className = "",
	min,
	max,
	name,
	onUpdate,
	prefix,
	value
}) {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [currentValue, setCurrentValue] = useState<number>(value);

	const onTriggerEdit = useCallback(() => {
		if (isEditing) return;
		setIsEditing(true);
		setCurrentValue(value);
	}, [isEditing, setIsEditing, setCurrentValue, value]);

	const onChange = useCallback((val: number) => {
		setCurrentValue(val);
	}, [setCurrentValue]);

	const onBlur = useCallback(() => {
		setIsEditing(false);
		if (currentValue === value) return;
		onUpdate(currentValue);
	}, [setIsEditing, value, currentValue, onUpdate]);

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === "Escape") {
			setIsEditing(false);
			setCurrentValue(value);
			return void e.preventDefault();
		} else if (e.key === "Enter") {
			setIsEditing(false);
			if (currentValue === value) return;
			onUpdate(currentValue);
			return void e.preventDefault();
		}
	}, [setIsEditing, setCurrentValue, value, currentValue, onUpdate]);

	useEffect(() => {
		setCurrentValue(value);
	}, [value, setCurrentValue]);

	return (
		<Table.Td className={ className } onClick={ onTriggerEdit } py={ 0 } >
			{
				isEditing ? (
					<NumberInput
						autoFocus
						className={ classes.editableTableCellInput }
						variant="unstyled"
						onBlur={ onBlur }
						onChange={ onChange }
						onKeyDown={ onKeyDown }
						name={ name }
						min={ min }
						max={ max }
						prefix={ prefix }
						size="xs"
						value={ currentValue }
					/>
				) : `${prefix || ""}${value}`
			}

		</Table.Td>
	);
});

export type EditableTableTextCellProps = {
	className?: string;
	name: string;
	onUpdate: (val: string) => void;
	value: string;
};

export const EditableTableTextCell: FC<EditableTableTextCellProps> = memo(function WrappedEditableTextField({
	className = "",
	name,
	onUpdate,
	value
}) {
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [currentValue, setCurrentValue] = useState<string>(value);

	const onTriggerEdit = useCallback(() => {
		if (isEditing) return;
		setIsEditing(true);
		setCurrentValue(value);
	}, [isEditing, setIsEditing, setCurrentValue, value]);

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		setCurrentValue(e.target.value);
	}, [setCurrentValue]);

	const onBlur = useCallback(() => {
		setIsEditing(false);
		if (currentValue === value) return;
		onUpdate(currentValue);
	}, [setIsEditing, value, currentValue, onUpdate]);

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === "Escape") {
			setIsEditing(false);
			setCurrentValue(value);
			return void e.preventDefault();
		} else if (e.key === "Enter") {
			setIsEditing(false);
			if (currentValue === value) return;
			onUpdate(currentValue);
			return void e.preventDefault();
		}
	}, [setIsEditing, setCurrentValue, value, currentValue, onUpdate]);

	useEffect(() => {
		setCurrentValue(value);
	}, [value, setCurrentValue]);

	return (
		<Table.Td className={ className } onClick={ onTriggerEdit } py={ 0 } >
			{
				isEditing ? (
					<TextInput
						autoFocus
						className={ classes.editableTableCellInput }
						variant="unstyled"
						onBlur={ onBlur }
						onChange={ onChange }
						onKeyDown={ onKeyDown }
						name={ name }
						size="xs"
						value={ currentValue }
					/>
				) : value
			}

		</Table.Td>
	);
});
