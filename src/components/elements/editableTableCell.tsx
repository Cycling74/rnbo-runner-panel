import { Group, NumberInput, Table } from "@mantine/core";
import { FC, memo, useCallback, useEffect, useState } from "react"

export type EditableTableNumberCellProps = {
	className?: string;
	min: number;
	max: number;
	name: string;
	onUpdate: (val: number) => void;
	value: number;
}

export const EditableTableNumberCell: FC<EditableTableNumberCellProps> = memo(function WrappedEditableMIDIField({
	className = "",
	min,
	max,
	name,
	onUpdate,
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

	useEffect(() => {
		setCurrentValue(value);
	}, [value, setCurrentValue]);

	return (
		<Table.Td className={ className } onClick={ onTriggerEdit } py={ 0 } >
			{
				isEditing ? (
					<NumberInput
						autoFocus
						variant="unstyled"
						onBlur={ onBlur }
						onChange={ onChange }
						name={ name }
						min={ min }
						max={ max }
						size="xs"
						value={ currentValue }
					/>
				) :  value
			}

		</Table.Td>
	)
})
