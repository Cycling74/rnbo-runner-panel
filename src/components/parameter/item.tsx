import React, { memo, useState, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import classes from "./parameters.module.css";
import { Group, Slider } from "@mantine/core";

export const parameterBoxHeight = 58;

interface ParameterProps {
	param: ParameterRecord;
	onSetNormalizedValue: (param: ParameterRecord, nValue: number) => void;
}

const Parameter = memo(function WrappedParameter({ param, onSetNormalizedValue }: ParameterProps) {

	const [localValue, setLocalValue] = useState(param.normalizedValue);
	const [useLocalValue, setUseLocalValue] = useState(false);

	const onChange = useCallback((nVal: number) => {
		if (!useLocalValue) setUseLocalValue(true);
		setLocalValue(nVal);
		onSetNormalizedValue(param, nVal);
	}, [useLocalValue, setUseLocalValue, setLocalValue, onSetNormalizedValue, param]);

	const onChangeEnd = useCallback((nVal: number) => {
		setUseLocalValue(false);
		onSetNormalizedValue(param, nVal);
	}, [setUseLocalValue, onSetNormalizedValue, param]);

	const currentValue = useLocalValue ? localValue : param.normalizedValue;
	const displayValue = param.getDisplayValueForNormalizedValue(currentValue);
	const stepSize = param.isEnum ? 1 / (param.enumVals.length - 1) : 0.001;

	return (
		<div className={ classes.parameterItem } >
			<Group justify="space-between">
				<label htmlFor={ param.name } className={ classes.parameterItemLabel } >{ param.name }</label>
			</Group>
			<Slider
				label={ displayValue }
				max={ 1 }
				min={ 0 }
				name={ param.name }
				onChange={ onChange }
				onChangeEnd={ onChangeEnd }
				precision={ 3 }
				step={ stepSize }
				value={ currentValue }
				marks={
					param.isEnum
						? param.enumVals.map((v, i) => ({ label: `${v}`, value: stepSize * i }))
						: [{ label: `${param.min}`, value: 0 }, { label: `${param.max}`, value: 1 }]
				}
			/>
		</div>
	);
});

export default Parameter;
