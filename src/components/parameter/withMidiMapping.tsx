import { ComponentType, FC, memo, useCallback } from "react";
import { ParameterRecord } from "../../models/parameter";
import { ParameterItemProps } from "./item";
import classes from "./parameters.module.css";

export type ParameterMIDIMappingProps = {
	instanceIsMIDIMapping: boolean;
	onActivateMIDIMapping: (param: ParameterRecord) => any;
};

export function withParameterMIDIMapping(
	WrappedComponent: ComponentType<ParameterItemProps>
) {

	const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

	const ParameterWithMIDIMapping: FC<ParameterItemProps & ParameterMIDIMappingProps> = memo(({
		instanceIsMIDIMapping,
		onActivateMIDIMapping,
		param,
		...props
	}) => {

		const onTriggerActivateMIDIMapping = useCallback(() => {
			if (param.waitingForMidiMapping) return;
			onActivateMIDIMapping(param);
		}, [param, onActivateMIDIMapping]);

		return (
			<div
				className={ `${classes.paramWithMIDIMapping} ${instanceIsMIDIMapping ? classes.paramWithActiveInstanceMapping : ""}` }
				data-active-mappping={ param.waitingForMidiMapping }
				onClick={ instanceIsMIDIMapping ? onTriggerActivateMIDIMapping : null }
			>
				<WrappedComponent param={ param } disabled={ instanceIsMIDIMapping } { ...props } />
			</div>
		);
	});

	ParameterWithMIDIMapping.displayName = `withParameterMIDIMapping(${displayName})`;

	return ParameterWithMIDIMapping;
}
