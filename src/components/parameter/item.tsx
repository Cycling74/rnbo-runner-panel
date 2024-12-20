import React, { memo, useState, useCallback, FC } from "react";
import { ParameterRecord } from "../../models/parameter";
import classes from "./parameters.module.css";
import { Slider } from "@mantine/core";
import { formatParamValueForDisplay } from "../../lib/util";

export const parameterBoxHeight = 87 + 6; // 87px + 6px margin

export type ParameterItemProps = {
	disabled?: boolean;
	index: number;
	param: ParameterRecord;
	onSetNormalizedValue: (param: ParameterRecord, nValue: number) => void;
};

const ParameterItem: FC<ParameterItemProps> = memo(function WrappedParameter({
	disabled = false,
	param,
	onSetNormalizedValue,
}: ParameterItemProps) {

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
		<Slider
			label={ formatParamValueForDisplay(value) }
			classNames={{ markWrapper: classes.markWrapper, markLabel: classes.markLabel }}
			className={ classes.parameterItemSlider }
			flex={ 1 }
			max={ 1 }
			min={ 0 }
			disabled={ disabled }
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
	);
});

export default ParameterItem;
