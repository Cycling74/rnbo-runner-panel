import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { DeviceTab } from "../../lib/constants";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import MessageInportList from "../messages/inportList";
import { SectionTitle } from "../page/sectionTitle";
import MessageOutportList from "../messages/outportList";
import classes from "./device.module.css";
import { DeviceStateRecord } from "../../models/device";
import { sendDeviceInstanceMessageToRemote } from "../../actions/instances";

export type DeviceMessageTabProps = {
	device: DeviceStateRecord;
	outputEnabled: boolean;
}

const DeviceMessagesTab: FunctionComponent<DeviceMessageTabProps> = memo(function WrappedDeviceMessagesTab({
	device,
	outputEnabled
}) {

	const dispatch = useAppDispatch();
	const onSendInportMessage = useCallback((id: string, value: string) => {
		dispatch(sendDeviceInstanceMessageToRemote(device, id, value));
	}, [dispatch, device]);

	return (
		<Tabs.Panel value={ DeviceTab.MessagePorts } >
			<SectionTitle>Inputs</SectionTitle>
			{
				device.messageInputs.size ? <MessageInportList inports={ device.messageInputs } onSendMessage={ onSendInportMessage } /> : (
					<div className={ classes.emptySection }>
						This device has no message inputs
					</div>
				)
			}
			<SectionTitle>Outputs</SectionTitle>
			{
				!device.messageOutputs.size ? (
					<div className={ classes.emptySection }>
						This device has no message outputs
					</div>
				) : !outputEnabled ? (
					<div className={ classes.disabledMessageOutput } >
						Message output monitoring is currently disabled. Enable it in the settings in order to display the output values.
					</div>
				) : <MessageOutportList outports={ device.messageOutputs } />
			}
		</Tabs.Panel>
	);
});

export default DeviceMessagesTab;
