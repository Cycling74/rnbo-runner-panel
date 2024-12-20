import { ComponentType, FC, memo, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import { ParameterItemProps } from "./item";
import classes from "./parameters.module.css";
import { ActionIcon, Group, Indicator, Menu, Tooltip } from "@mantine/core";
import { formatMIDIMappingToDisplay } from "../../lib/util";
import { MIDIMetaMappingType } from "../../lib/constants";
import { mdiArrowDown, mdiArrowUp, mdiDotsVertical, mdiMinus } from "@mdi/js";
import { IconElement } from "../elements/icon";

export type ParameterSetViewWrapProps = {
	listSize: number;
	onDecreaseIndex: (param: ParameterRecord) => void;
	onIncreaseIndex: (param: ParameterRecord) => void;
	onRemoveFromSetView: (param: ParameterRecord) => void;
};

export function withParameterSetViewWrap(
	WrappedComponent: ComponentType<ParameterItemProps>
) {

	const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

	const ParameterWithMIDIMapping: FC<ParameterItemProps & ParameterSetViewWrapProps> = memo(({
		index,
		listSize,
		onDecreaseIndex,
		onIncreaseIndex,
		onRemoveFromSetView,
		param,
		...props
	}) => {

		const onTriggerRemoveFromSetView = useCallback(() => {
			onRemoveFromSetView(param);
		}, [param, onRemoveFromSetView]);

		const onTriggerMoveUp = useCallback(() => {
			onDecreaseIndex(param);
		}, [param, onDecreaseIndex]);

		const onTriggerMoveDown = useCallback(() => {
			onIncreaseIndex(param);
		}, [param, onIncreaseIndex]);

		const indicatorText = param.isMidiMapped
			? `MIDI: ${formatMIDIMappingToDisplay(param.midiMappingType as MIDIMetaMappingType, param.meta.midi)}`
			: undefined;

		return (
			<div
				className={ `${classes.parameterWrap}` }
			>
				<Group justify="space-between">
					<Tooltip label={ indicatorText } disabled={ !indicatorText }>
						<Indicator
							position="middle-end"
							disabled={ !indicatorText }
							classNames={{ root: classes.parameterItemMIDIIndicator }}
						>
							<label htmlFor={ param.name } className={ classes.parameterItemLabel } >
								{ param.instanceIndex}: { param.name }
							</label>
						</Indicator>
					</Tooltip>
				</Group>
				<Group>
					<WrappedComponent index={ index } param={ param } { ...props } />
					<Menu position="bottom-end" >
						<Menu.Target>
							<Tooltip label="Open Parameter Action Menu">
								<ActionIcon variant="subtle" color="gray" size="md" className={ classes.parameterItemActionMenuTarget } >
									<IconElement path={ mdiDotsVertical } />
								</ActionIcon>
							</Tooltip>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Label>SetView Parameter Actions</Menu.Label>
							<Menu.Item  leftSection={ <IconElement path={ mdiArrowUp } /> } onClick={ onTriggerMoveUp } disabled={ index === 0 } >
								Move Up
							</Menu.Item>
							<Menu.Item leftSection={ <IconElement path={ mdiArrowDown } /> } onClick={ onTriggerMoveDown } disabled={ index === listSize - 1 } >
								Move Down
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item color="red" leftSection={ <IconElement path={ mdiMinus } /> } onClick={ onTriggerRemoveFromSetView } >
								Remove from SetView
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
