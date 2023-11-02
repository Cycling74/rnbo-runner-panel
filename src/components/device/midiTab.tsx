import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { DeviceTab } from "../../lib/constants";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import KeyRoll from "../keyroll";
import { DeviceStateRecord } from "../../models/device";
import { triggerDeviceInstanceMidiNoteOffEventOnRemote, triggerDeviceInstanceMidiNoteOnEventOnRemote } from "../../actions/instances";

export type DeviceMIDITabProps = {
	device: DeviceStateRecord;
}

const DeviceMIDITab: FunctionComponent<DeviceMIDITabProps> = memo(function WrappedDeviceMIDITab({
	device
}) {

	const dispatch = useAppDispatch();

	const triggerMIDINoteOn = useCallback((p: number) => {
		dispatch(triggerDeviceInstanceMidiNoteOnEventOnRemote(device, p));
	}, [dispatch, device]);

	const triggerMIDINoteOff = useCallback((p: number) => {
		dispatch(triggerDeviceInstanceMidiNoteOffEventOnRemote(device, p));
	}, [dispatch, device]);

	return (
		<Tabs.Panel value={ DeviceTab.MIDI } >
			<KeyRoll onTriggerNoteOn={ triggerMIDINoteOn } onTriggerNoteOff={ triggerMIDINoteOff } />
		</Tabs.Panel>
	);
});

export default DeviceMIDITab;
