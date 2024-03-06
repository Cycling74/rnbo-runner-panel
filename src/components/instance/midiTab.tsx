import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { InstanceTab } from "../../lib/constants";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import KeyRoll from "../keyroll";
import { InstanceStateRecord } from "../../models/instance";
import { triggerInstanceMidiNoteOffEventOnRemote, triggerInstanceMidiNoteOnEventOnRemote } from "../../actions/instances";

export type InstanceMIDITabProps = {
	instance: InstanceStateRecord;
}

const InstanceMIDITab: FunctionComponent<InstanceMIDITabProps> = memo(function WrappedInstanceMIDITab({
	instance
}) {

	const dispatch = useAppDispatch();

	const triggerMIDINoteOn = useCallback((p: number) => {
		dispatch(triggerInstanceMidiNoteOnEventOnRemote(instance, p));
	}, [dispatch, instance]);

	const triggerMIDINoteOff = useCallback((p: number) => {
		dispatch(triggerInstanceMidiNoteOffEventOnRemote(instance, p));
	}, [dispatch, instance]);

	return (
		<Tabs.Panel value={ InstanceTab.MIDI } >
			<KeyRoll onTriggerNoteOn={ triggerMIDINoteOn } onTriggerNoteOff={ triggerMIDINoteOff } />
		</Tabs.Panel>
	);
});

export default InstanceMIDITab;
