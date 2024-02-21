import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { DeviceTab } from "../../lib/constants";
import ParameterList from "../parameter/list";
import { ParameterRecord } from "../../models/parameter";
import classes from "./device.module.css";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { DeviceStateRecord } from "../../models/device";
import { setDeviceInstanceParameterValueNormalizedOnRemote } from "../../actions/instances";

export type DeviceParameterTabProps = {
	device: DeviceStateRecord;
}

const DeviceParameterTab: FunctionComponent<DeviceParameterTabProps> = memo(function WrappedDeviceParameterTab({
	device
}) {

	const dispatch = useAppDispatch();
	const onSetNormalizedParamValue = useCallback((param: ParameterRecord, val: number) => {
		dispatch(setDeviceInstanceParameterValueNormalizedOnRemote(device, param, val));
	}, [dispatch, device]);

	return (
		<Tabs.Panel value={ DeviceTab.Parameters } >
			{
				!device.parameters.size ? (
					<div className={ classes.emptySection }>
						This instance has no parameters
					</div>
				) : (
					<div className={ classes.paramSectionWrap } >
						<ParameterList parameters={ device.parameters } onSetNormalizedValue={ onSetNormalizedParamValue } />
					</div>
				)
			}
		</Tabs.Panel>
	);
});

export default DeviceParameterTab;
