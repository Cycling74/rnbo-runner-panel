import { ComponentType, FC, memo, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import { ParameterItemProps, ParameterMenuEntryType } from "./item";
import { mdiArrowDown, mdiArrowUp, mdiMinusBox } from "@mdi/js";

export type ParameterSetViewActionsProps = {
	listSize: number;
	onDecreaseIndex: (param: ParameterRecord) => void;
	onIncreaseIndex: (param: ParameterRecord) => void;
	onRemoveFromSetView: (param: ParameterRecord) => void;
};

export function withParameterSetViewActions(
	WrappedComponent: ComponentType<ParameterItemProps>
) {

	const compDisplayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

	const ParameterWithSetViewActions: FC<ParameterItemProps & ParameterSetViewActionsProps> = memo(({
		menuItems = [],
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

		return (
			<WrappedComponent
				displayPrefix={ `${param.instanceId}:` }
				index={ index }
				param={ param }
				{ ...props }
				menuItems={[
					...menuItems,
					{ type: ParameterMenuEntryType.Divider },
					{ type: ParameterMenuEntryType.Action, icon: mdiArrowUp, action: onTriggerMoveUp, disabled: index === 0, label: "Move Up" },
					{ type: ParameterMenuEntryType.Action, icon: mdiArrowDown, action: onTriggerMoveDown, disabled: index === listSize - 1, label: "Move Down" },
					{ type: ParameterMenuEntryType.Action, icon: mdiMinusBox, action: onTriggerRemoveFromSetView, label: "Remove from SetView" }
				]}
			/>
		);
	});

	ParameterWithSetViewActions.displayName = `withParameterSetViewMapping(${compDisplayName})`;

	return ParameterWithSetViewActions;
}
