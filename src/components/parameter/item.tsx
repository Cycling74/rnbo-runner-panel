import React, { memo, useState, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import classes from "./parameters.module.css";
import { Group, Slider } from "@mantine/core";

export const parameterBoxHeight = 58;

interface ParameterProps {
	record: ParameterRecord;
	onSetValue: (name: string, value: number) => void;
}

const Parameter = memo(function WrappedParameter({ record, onSetValue }: ParameterProps) {

	const [localValue, setLocalValue] = useState(record.normalizedValue);
	const [useLocalValue, setUseLocalValue] = useState(false);

	const onChange = useCallback((nVal: number) => {
		if (!useLocalValue) setUseLocalValue(true);
		setLocalValue(nVal);
		onSetValue(record.name, nVal);
	}, [useLocalValue, setUseLocalValue, setLocalValue, onSetValue, record]);

	const onChangeEnd = useCallback((nVal: number) => {
		setUseLocalValue(false);
		onSetValue(record.name, nVal);
	}, [setUseLocalValue, onSetValue, record]);

	const currentValue = useLocalValue ? localValue : record.normalizedValue;
	const displayValue = typeof record.value === "number" ? record.value.toFixed(2) : record.value;

	return (
		<div className={ classes.parameterItem } >
			<Group justify="space-between">
				<label htmlFor={ record.name } className={ classes.parameterItemLabel } >{ record.name }</label>
			</Group>
			<Slider
				label={ displayValue }
				max={ 1 }
				min={ 0 }
				name={ record.name }
				onChange={ onChange }
				onChangeEnd={ onChangeEnd }
				precision={ 2 }
				step={ 0.001 }
				value={ currentValue }
			/>
		</div>
	);
});

export default Parameter;
