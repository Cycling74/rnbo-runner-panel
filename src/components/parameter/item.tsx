import React, { memo, useState, useCallback, FC } from "react";
import { ParameterRecord } from "../../models/parameter";
import classes from "./parameters.module.css";
import { ActionIcon, Group, Menu, Indicator, Slider, Tooltip, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { MetadataScope, MIDIMetaMappingType } from "../../lib/constants";
import { IconElement } from "../elements/icon";
import { mdiCodeBraces, mdiDotsVertical, mdiEraser } from "@mdi/js";
import { modals } from "@mantine/modals";
import { formatMIDIMappingToDisplay, formatParamValueForDisplay } from "../../lib/util";

export const parameterBoxHeight = 87 + 6; // 87px + 6px margin

export type ParameterItemProps = {
	disabled?: boolean;
	param: ParameterRecord;
	onRestoreMetadata: (param: ParameterRecord) => any;
	onSaveMetadata: (param: ParameterRecord, meta: string) => any;
	onSetNormalizedValue: (param: ParameterRecord, nValue: number) => void;
	onClearMidiMapping: (param: ParameterRecord) => void;
};

const ParameterItem: FC<ParameterItemProps> = memo(function WrappedParameter({
	disabled = false,
	param,
	onSetNormalizedValue,
	onSaveMetadata,
	onRestoreMetadata,
	onClearMidiMapping
}: ParameterItemProps) {

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

	const onSaveMeta = useCallback((meta: string) => onSaveMetadata(param, meta), [param, onSaveMetadata]);
	const onRestoreMeta = useCallback(() => onRestoreMetadata(param), [param, onRestoreMetadata]);

	const onClearMidiMap = useCallback(() => {
		modals.openConfirmModal({
			title: "Clear Parameter MIDI Mapping",
			centered: true,
			children: (
				<Text size="sm" id="red">
					Are you sure you want to clear the active MIDI mapping for { `"${param.name}"` }?
				</Text>
			),
			labels: { confirm: "Clear", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => onClearMidiMapping(param)
		});
	}, [param, onClearMidiMapping]);

	const currentValue = useLocalValue ? localValue : param.normalizedValue;
	const value = param.getValueForNormalizedValue(currentValue);
	const stepSize = param.isEnum ? 1 / (param.enumVals.length - 1) : 0.001;

	const indicatorText = param.isMidiMapped
		? `MIDI: ${formatMIDIMappingToDisplay(param.midiMappingType as MIDIMetaMappingType, param.meta.midi)}`
		: undefined;

	return (
		<div
			className={ classes.parameterItem }
		>
			{
				showMetaEditor ? (
					<MetaEditorModal
						onClose={ closeMetaEditor }
						onRestore={ onRestoreMeta }
						onSaveMeta={ onSaveMeta }
						meta={ param.metaString }
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
				<Menu position="bottom-end" disabled={ disabled } >
					<Menu.Target>
						<Tooltip label="Open Parameter Action Menu">
							<ActionIcon variant="subtle" color="gray" size="md" className={ classes.parameterItemActionMenuTarget } >
								<IconElement path={ mdiDotsVertical } />
							</ActionIcon>
						</Tooltip>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>Parameter Actions</Menu.Label>
						<Menu.Item leftSection={ <IconElement path={ mdiCodeBraces } /> } onClick={ toggleMetaEditor }>
							Edit Metadata
						</Menu.Item>
						<Menu.Item color="red" leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onClearMidiMap } disabled={ !param.isMidiMapped } >
							Clear MIDI Mapping
						</Menu.Item>
					</Menu.Dropdown>
				</Menu>
			</Group>
		</div>
	);
});

export default ParameterItem;
