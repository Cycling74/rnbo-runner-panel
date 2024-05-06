import React, { memo, useState, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import classes from "./parameters.module.css";
import { Group, Slider } from "@mantine/core";

export const parameterBoxHeight = 70;
const formatParamValueForDisplay = (value: number | string) => {
	if (typeof value === "number") return Number.isInteger(value) ? value : value.toFixed(2);
	return value;
};

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
	const value = param.getValueForNormalizedValue(currentValue);
	const stepSize = param.isEnum ? 1 / (param.enumVals.length - 1) : 0.001;

	return (
		<div className={ classes.parameterItem } >
			<Group justify="space-between">
				<label htmlFor={ param.name } className={ classes.parameterItemLabel } >{ param.name }</label>
			</Group>
			<Slider
				label={ formatParamValueForDisplay(value) }
				classNames={{ markWrapper: classes.markWrapper, markLabel: classes.markLabel }}
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
						: [{ label: `${formatParamValueForDisplay(param.min)}`, value: 0 }, { label: `${formatParamValueForDisplay(param.max)}`, value: 1 }]
				}
			/>
		</div>
	);
});

export default Parameter;
