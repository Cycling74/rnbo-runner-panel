import React, { memo, useState, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import classes from "./parameters.module.css";
import { ActionIcon, Group, Menu, Slider } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { useDisclosure } from "@mantine/hooks";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope } from "../../lib/constants";

export const parameterBoxHeight = 70;
const formatParamValueForDisplay = (value: number | string) => {
	if (typeof value === "number") return Number.isInteger(value) ? value : value.toFixed(2);
	return value;
};

interface ParameterProps {
	param: ParameterRecord;
	onRestoreMetadata: (param: ParameterRecord) => any;
	onSaveMetadata: (param: ParameterRecord, meta: string) => any;
	onSetNormalizedValue: (param: ParameterRecord, nValue: number) => void;
}

const Parameter = memo(function WrappedParameter({ param, onSetNormalizedValue, onSaveMetadata, onRestoreMetadata }: ParameterProps) {

	const [localValue, setLocalValue] = useState(param.normalizedValue);
	const [useLocalValue, setUseLocalValue] = useState(false);
	const [showMetaEditor, { toggle: toggleMetaEditor, close: closeMetaEditor }] = useDisclosure();

	const onChange = useCallback((nVal: number) => {
		if (!useLocalValue) setUseLocalValue(true);
		setLocalValue(nVal);
		onSetNormalizedValue(param, nVal);
	}, [useLocalValue, setUseLocalValue, setLocalValue, onSetNormalizedValue, param]);

	const onChangeEnd = useCallback((nVal: number) => {
		setUseLocalValue(false);
		onSetNormalizedValue(param, nVal);
	}, [setUseLocalValue, onSetNormalizedValue, param]);

	const onSaveMeta = useCallback((meta: string) => {
		onSaveMetadata(param, meta);
	}, [param, onSaveMetadata]);

	const onRestoreMeta = useCallback(() => {
		onRestoreMetadata(param);
	}, [param, onRestoreMetadata]);

	const currentValue = useLocalValue ? localValue : param.normalizedValue;
	const value = param.getValueForNormalizedValue(currentValue);
	const stepSize = param.isEnum ? 1 / (param.enumVals.length - 1) : 0.001;

	return (
		<div className={ classes.parameterItem } >
			{
				showMetaEditor ? (
					<MetaEditorModal
						onClose={ closeMetaEditor }
						onRestore={ onRestoreMeta }
						onSaveMeta={ onSaveMeta }
						meta={ param.meta }
						name={ param.name }
						scope={ MetadataScope.Parameter }
					/>
				) : null
			}
			<Group justify="space-between">
				<label htmlFor={ param.name } className={ classes.parameterItemLabel } >{ param.name }</label>
			</Group>
			<Group>
				<Slider
					label={ formatParamValueForDisplay(value) }
					classNames={{ markWrapper: classes.markWrapper, markLabel: classes.markLabel }}
					flex={ 1 }
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
				<Menu position="bottom-end">
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray" size="md">
							<FontAwesomeIcon icon={ faEllipsisVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Actions</Menu.Label>
						<Menu.Item leftSection={ <FontAwesomeIcon fixedWidth icon={ faCode } /> } onClick={ toggleMetaEditor }>
							Edit Metadata
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</div>
	);
});

export default Parameter;
