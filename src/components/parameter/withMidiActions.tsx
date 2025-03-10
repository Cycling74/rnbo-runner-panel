import { ComponentType, FC, memo, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import { ParameterItemProps, ParameterMenuEntryType } from "./item";
import classes from "./parameters.module.css";
import { mdiEraser } from "@mdi/js";

export type ParameterMIDIActionsProps = {
	instanceIsMIDIMapping: boolean;
	onActivateMIDIMapping: (param: ParameterRecord) => any;
	onClearMidiMapping: (param: ParameterRecord) => void;
};

export function withParameterMIDIActions(
	WrappedComponent: ComponentType<ParameterItemProps>
) {

	const compDisplayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

	const ParameterWithMIDIActions: FC<ParameterItemProps & ParameterMIDIActionsProps> = memo(({
		instanceIsMIDIMapping,
		onActivateMIDIMapping,
		onClearMidiMapping,
		menuItems = [],
		param,
		...props
	}) => {

		const onClearMidiMap = useCallback(() => {
			onClearMidiMapping(param);
		}, [param, onClearMidiMapping]);

		const onTriggerActivateMIDIMapping = useCallback(() => {
			if (param.waitingForMidiMapping) return;
			onActivateMIDIMapping(param);
		}, [param, onActivateMIDIMapping]);

		return (
			<WrappedComponent
				className={ classes.paramWithMIDIMapping }
				param={ param }
				data-instance-mapping={ instanceIsMIDIMapping }
				data-param-mappping={ param.waitingForMidiMapping }
				disabled={ instanceIsMIDIMapping }
				onClick={ instanceIsMIDIMapping ? onTriggerActivateMIDIMapping : null }
				menuItems={ [
					...menuItems,
					{ type: ParameterMenuEntryType.Divider },
					{ type: ParameterMenuEntryType.Action, color: "red", label: "Clear MIDI Mapping", icon: mdiEraser, action: onClearMidiMap, disabled: !param.isMidiMapped }
				] }
				{ ...props }
			/>
		);
	});

	ParameterWithMIDIActions.displayName = `withParameterMIDIMapping(${compDisplayName})`;

	return ParameterWithMIDIActions;
}
