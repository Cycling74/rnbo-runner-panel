import React, { memo, useState, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import classes from "./parameters.module.css";
import { ActionIcon, Group, Menu, Indicator, Slider, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope } from "../../lib/constants";
import { IconElement } from "../elements/icon";
import { mdiCodeBraces, mdiDotsVertical, mdiEraser } from "@mdi/js";

export const parameterBoxHeight = 87 + 6; // 87px + 6px margin
const formatParamValueForDisplay = (value: number | string) => {
	if (typeof value === "number") return Number.isInteger(value) ? value : value.toFixed(2);
	return value;
};

interface ParameterProps {
	instanceIsMIDIMapping: boolean;
	param: ParameterRecord;
	onActivateMIDIMapping: (param: ParameterRecord) => any;
	onRestoreMetadata: (param: ParameterRecord) => any;
	onSaveMetadata: (param: ParameterRecord, meta: string) => any;
	onSetNormalizedValue: (param: ParameterRecord, nValue: number) => void;
	onClearMidiMapping: (param: ParameterRecord) => void;
}

const Parameter = memo(function WrappedParameter({
	instanceIsMIDIMapping,
	param,
	onActivateMIDIMapping,
	onSetNormalizedValue,
	onSaveMetadata,
	onRestoreMetadata,
	onClearMidiMapping
}: ParameterProps) {

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

	const onTriggerActivateMIDIMapping = useCallback(() => {
		if (param.waitingForMidiMapping) return;
		onActivateMIDIMapping(param);
	}, [param, onActivateMIDIMapping]);

	const onSaveMeta = useCallback((meta: string) => onSaveMetadata(param, meta), [param, onSaveMetadata]);
	const onRestoreMeta = useCallback(() => onRestoreMetadata(param), [param, onRestoreMetadata]);
	const onClearMidiMap = useCallback(() => onClearMidiMapping(param), [param, onClearMidiMapping]);

	const currentValue = useLocalValue ? localValue : param.normalizedValue;
	const value = param.getValueForNormalizedValue(currentValue);
	const stepSize = param.isEnum ? 1 / (param.enumVals.length - 1) : 0.001;

	const indicatorText = param.isMidiMapped ? "This param is MIDI mapped" : undefined;

	return (
		<div
			className={ classes.parameterItem }
			data-active-midi-mappping={ param.waitingForMidiMapping }
			onClick={ instanceIsMIDIMapping ? onTriggerActivateMIDIMapping : null }
		>
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
				<Tooltip label={ indicatorText } disabled={ !indicatorText }>
					<Indicator
						position="middle-end"
						disabled={ !indicatorText }
						classNames={{ root: classes.parameterItemMIDIIndicator }}
					>
						<label htmlFor={ param.name } className={ classes.parameterItemLabel } >
							{ param.name }
						</label>
					</Indicator>
				</Tooltip>
			</Group>
			<Group>
				<Slider
					label={ formatParamValueForDisplay(value) }
					classNames={{ markWrapper: classes.markWrapper, markLabel: classes.markLabel }}
					className={ classes.parameterItemSlider }
					flex={ 1 }
					max={ 1 }
					min={ 0 }
					disabled={ instanceIsMIDIMapping }
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
				<Menu position="bottom-end" disabled={ instanceIsMIDIMapping } >
					<Menu.Target>
						<ActionIcon variant="subtle" color="gray" size="md" className={ classes.parameterItemActionMenuTarget } >
							<IconElement path={ mdiDotsVertical } />
						</ActionIcon>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Actions</Menu.Label>
						<Menu.Item leftSection={ <IconElement path={ mdiCodeBraces } /> } onClick={ toggleMetaEditor }>
							Edit Metadata
						</Menu.Item>
						<Menu.Item leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onClearMidiMap } disabled={ !param.isMidiMapped } >
							Clear Midi Mapping
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</div>
	);
});

export default Parameter;
