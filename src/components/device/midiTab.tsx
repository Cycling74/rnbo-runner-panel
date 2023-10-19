import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { DeviceTab } from "../../lib/constants";
import { GraphPatcherNodeRecord } from "../../models/graph";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { triggerMidiNoteOffEventOnRemoteInstance, triggerMidiNoteOnEventOnRemoteInstance } from "../../actions/device";
import KeyRoll from "../keyroll";

export type DeviceMIDITabProps = {
	device: GraphPatcherNodeRecord;
}

const DeviceMIDITab: FunctionComponent<DeviceMIDITabProps> = memo(function WrappedDeviceMIDITab({
	device
}) {

	const dispatch = useAppDispatch();

	const triggerMIDINoteOn = useCallback((p: number) => {
		dispatch(triggerMidiNoteOnEventOnRemoteInstance(device, p));
	}, [dispatch, device]);

	const triggerMIDINoteOff = useCallback((p: number) => {
		dispatch(triggerMidiNoteOffEventOnRemoteInstance(device, p));
	}, [dispatch, device]);

	return (
		<Tabs.Panel value={ DeviceTab.MIDI } >
			<KeyRoll onTriggerNoteOn={ triggerMIDINoteOn } onTriggerNoteOff={ triggerMIDINoteOff } />
		</Tabs.Panel>
	);
});

export default DeviceMIDITab;
