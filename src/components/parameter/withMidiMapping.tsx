import { ComponentType, FC, memo, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import { ParameterItemProps } from "./item";
import classes from "./parameters.module.css";
import { ActionIcon, Group, Indicator, Menu, Text, Tooltip } from "@mantine/core";
import { formatMIDIMappingToDisplay } from "../../lib/util";
import { MetadataScope, MIDIMetaMappingType } from "../../lib/constants";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { MetaEditorModal } from "../meta/metaEditorModal";
import { mdiCodeBraces, mdiDotsVertical, mdiEraser } from "@mdi/js";
import { IconElement } from "../elements/icon";

export type ParameterMIDIMappingProps = {
	instanceIsMIDIMapping: boolean;
	onActivateMIDIMapping: (param: ParameterRecord) => any;
	onRestoreMetadata: (param: ParameterRecord) => any;
	onSaveMetadata: (param: ParameterRecord, meta: string) => any;
	onClearMidiMapping: (param: ParameterRecord) => void;
};

export function withParameterMIDIMapping(
	WrappedComponent: ComponentType<ParameterItemProps>
) {

	const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

	const ParameterWithMIDIMapping: FC<ParameterItemProps & ParameterMIDIMappingProps> = memo(({
		instanceIsMIDIMapping,
		onActivateMIDIMapping,
		onSaveMetadata,
		onRestoreMetadata,
		onClearMidiMapping,
		param,
		...props
	}) => {

		const [showMetaEditor, { toggle: toggleMetaEditor, close: closeMetaEditor }] = useDisclosure();
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

		const onTriggerActivateMIDIMapping = useCallback(() => {
			if (param.waitingForMidiMapping) return;
			onActivateMIDIMapping(param);
		}, [param, onActivateMIDIMapping]);

		const indicatorText = param.isMidiMapped
			? `MIDI: ${formatMIDIMappingToDisplay(param.midiMappingType as MIDIMetaMappingType, param.meta.midi)}`
			: undefined;

		return (
			<div
				className={ `${classes.parameterWrap} ${classes.paramWithMIDIMapping}` }
				data-instance-mapping={ instanceIsMIDIMapping }
				data-active-mappping={ param.waitingForMidiMapping }
				onClick={ instanceIsMIDIMapping ? onTriggerActivateMIDIMapping : null }
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
					<WrappedComponent param={ param } disabled={ instanceIsMIDIMapping } { ...props } />
					<Menu position="bottom-end" disabled={ instanceIsMIDIMapping } >
						<Menu.Target>
							<Tooltip label="Open Parameter Menu" disabled={ instanceIsMIDIMapping }>
								<ActionIcon variant="subtle" color="gray" size="md" disabled={ instanceIsMIDIMapping } >
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item leftSection={ <IconElement path={ mdiCodeBraces } /> } onClick={ toggleMetaEditor }>
								Edit Metadata
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item color="red" leftSection={ <IconElement path={ mdiEraser } /> } onClick={ onClearMidiMap } disabled={ !param.isMidiMapped } >
								Clear MIDI Mapping
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				</Group>
			</div>
		);
	});

	ParameterWithMIDIMapping.displayName = `withParameterMIDIMapping(${displayName})`;

	return ParameterWithMIDIMapping;
}
