import React, { memo, useState, useCallback, FC } from "react";
import { ParameterRecord } from "../../models/parameter";
import classes from "./parameters.module.css";
import { ActionIcon, Group, Indicator, MantineColor, Menu, Slider, Tooltip } from "@mantine/core";
import { formatMIDIMappingToDisplay, formatParamValueForDisplay } from "../../lib/util";
import { MetadataScope, MIDIMetaMappingType } from "../../lib/constants";
import { mdiCodeBraces, mdiDotsVertical } from "@mdi/js";
import { IconElement } from "../elements/icon";
import { useDisclosure } from "@mantine/hooks";
import { MetaEditorModal } from "../meta/metaEditorModal";

export const parameterBoxHeight = 87 + 6; // 87px + 6px margin

export enum ParameterMenuEntryType {
	Action,
	Divider
}

export type ParameterMenuAction = {
	action: () => void;
	color?: MantineColor;
	disabled?: boolean;
	icon: string;
	label: string;
	type: ParameterMenuEntryType.Action;
};

export type ParameterMenuDivider = {
	type: ParameterMenuEntryType.Divider
};

export type ParameterMenuItem = ParameterMenuAction | ParameterMenuDivider;

export type ParameterItemProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
	menuItems?: Array<ParameterMenuItem>
	disabled?: boolean;
	displayName?: string;
	index: number;
	param: ParameterRecord;
	onRestoreMetadata: (param: ParameterRecord) => any;
	onSaveMetadata: (param: ParameterRecord, meta: string) => any;
	onSetNormalizedValue: (param: ParameterRecord, nValue: number) => void;
};

const renderMenuItem = (entry: ParameterMenuItem, i: number): React.ReactNode => {
	switch (entry.type) {
		case ParameterMenuEntryType.Divider:
			return <Menu.Divider key={ i } />;
		case ParameterMenuEntryType.Action:
			return (
				<Menu.Item key={ i } color={ entry.color } leftSection={ <IconElement path={ entry.icon } /> } onClick={ entry.action } disabled={ entry.disabled || false } >
					{ entry.label }
				</Menu.Item>
			);
		default:
			return null;
	}
};

const ParameterItem: FC<ParameterItemProps> = memo(function WrappedParameter({
	menuItems = [],
	className = "",
	disabled = false,
	displayName,
	param,
	onRestoreMetadata,
	onSaveMetadata,
	onSetNormalizedValue,
	...props
}: ParameterItemProps) {

	const [showMetaEditor, { toggle: toggleMetaEditor, close: closeMetaEditor }] = useDisclosure();
	const onSaveMeta = useCallback((meta: string) => onSaveMetadata(param, meta), [param, onSaveMetadata]);
	const onRestoreMeta = useCallback(() => onRestoreMetadata(param), [param, onRestoreMetadata]);
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
	const indicatorText = param.isMidiMapped
		? `MIDI: ${formatMIDIMappingToDisplay(param.midiMappingType as MIDIMetaMappingType, param.meta.midi)}`
		: undefined;

	return (
		<div
			className={ `${classes.parameterWrap} ${className}` }
			{ ...props }
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
							{ displayName || param.name }
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
						<Tooltip label="Open Parameter Menu" disabled={ disabled }>
							<ActionIcon variant="subtle" color="gray" size="md" disabled={ disabled } >
								<IconElement path={ mdiDotsVertical } />
							</ActionIcon>
						</Tooltip>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Item leftSection={ <IconElement path={ mdiCodeBraces } /> } onClick={ toggleMetaEditor }>
							Edit Metadata
						</Menu.Item>
						{ menuItems.map(renderMenuItem) }
					</Menu.Dropdown>
				</Menu>
			</Group>
		</div>
	);
});

export default ParameterItem;
