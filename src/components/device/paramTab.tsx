import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { DeviceTab } from "../../lib/constants";
import ParameterList from "../parameter/list";
import { GraphPatcherNodeRecord } from "../../models/graph";
import { ParameterRecord } from "../../models/parameter";
import classes from "./device.module.css";
import PresetControl from "../parameter/presets";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { PresetRecord } from "../../models/preset";
import { loadPresetOnRemoteInstance, savePresetToRemoteInstance, setParameterValueNormalizedOnRemote } from "../../actions/device";

export type DeviceParameterTabProps = {
	device: GraphPatcherNodeRecord;
}

const DeviceParameterTab: FunctionComponent<DeviceParameterTabProps> = memo(function WrappedDeviceParameterTab({
	device
}) {

	const dispatch = useAppDispatch();
	const onSetNormalizedParamValue = useCallback((param: ParameterRecord, val: number) => {
		dispatch(setParameterValueNormalizedOnRemote(device, param, val));
	}, [dispatch, device]);

	const onLoadPreset = useCallback((preset: PresetRecord) => {
		dispatch(loadPresetOnRemoteInstance(device, preset));
	}, [dispatch, device]);

	const onSavePreset = useCallback((name: string) => {
		dispatch(savePresetToRemoteInstance(device, name));
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
						<div className={ classes.presetWrap } >
							<PresetControl
								presets={ device.presets }
								onLoadPreset={ onLoadPreset }
								onSavePreset={ onSavePreset }
							/>
						</div>
						<div className={ classes.paramListWrap } >
							<ParameterList parameters={ device.parameters } onSetNormalizedValue={ onSetNormalizedParamValue } />
						</div>
					</div>
				)
			}
		</Tabs.Panel>
	);
});

export default DeviceParameterTab;
