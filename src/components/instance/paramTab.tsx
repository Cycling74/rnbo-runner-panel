import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { InstanceTab } from "../../lib/constants";
import ParameterList from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import classes from "./instance.module.css";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { InstanceStateRecord } from "../../models/instance";
import { seInstanceParameterValueNormalizedOnRemote } from "../../actions/instances";

export type InstanceParameterTabProps = {
	instance: InstanceStateRecord;
}

const InstanceParameterTab: FunctionComponent<InstanceParameterTabProps> = memo(function WrappedInstanceParameterTab({
	instance
}) {

	const dispatch = useAppDispatch();
	const onSetNormalizedParamValue = useCallback((param: ParameterRecord, val: number) => {
		dispatch(seInstanceParameterValueNormalizedOnRemote(instance, param, val));
	}, [dispatch, instance]);

	return (
		<Tabs.Panel value={ InstanceTab.Parameters } >
			{
				!instance.parameters.size ? (
					<div className={ classes.emptySection }>
						This patcher instance has no parameters
					</div>
				) : (
					<div className={ classes.paramSectionWrap } >
						<ParameterList parameters={ instance.parameters } onSetNormalizedValue={ onSetNormalizedParamValue } />
					</div>
				)
			}
		</Tabs.Panel>
	);
});

export default InstanceParameterTab;
