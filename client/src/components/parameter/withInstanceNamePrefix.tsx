import { ComponentType, FC, memo } from "react";
import { Map as ImmuMap } from "immutable";
import { ParameterItemProps } from "./item";
import { PatcherInstanceRecord } from "../../models/instance";

export type ParameterWithInstanceNamePrefixProps = {
	patcherInstances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>;
};

export function withPatcherInstanceNamePrefix(
	WrappedComponent: ComponentType<ParameterItemProps>
) {

	const compDisplayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

	const ParameterWithInstanceNamePrefix: FC<ParameterItemProps & ParameterWithInstanceNamePrefixProps> = memo(({
		patcherInstances,
		param,
		...props
	}) => {

		return (
			<WrappedComponent
				label={`${patcherInstances.get(param.instanceId)?.displayName || ""}: ${param.label}` }
				param={ param }
				{ ...props }
			/>
		);
	});

	ParameterWithInstanceNamePrefix.displayName = `withPatcherInstanceNamePrefix(${compDisplayName})`;

	return ParameterWithInstanceNamePrefix;
}
