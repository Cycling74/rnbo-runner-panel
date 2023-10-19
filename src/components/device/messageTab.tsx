import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { DeviceTab } from "../../lib/constants";
import { GraphPatcherNodeRecord } from "../../models/graph";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { sendMessageToRemoteInstanceInport } from "../../actions/device";
import MessageInportList from "../messages/inportList";
import { MessageInportRecord } from "../../models/messages";
import { SectionTitle } from "../page/sectionTitle";
import MessageOutportList from "../messages/outportList";
import classes from "./device.module.css";

export type DeviceMessageTabProps = {
	device: GraphPatcherNodeRecord;
	outputEnabled: boolean;
}

const DeviceMessagesTab: FunctionComponent<DeviceMessageTabProps> = memo(function WrappedDeviceMessagesTab({
	device,
	outputEnabled
}) {

	const dispatch = useAppDispatch();
	const onSendMessage = useCallback((port: MessageInportRecord, value: string) => {
		dispatch(sendMessageToRemoteInstanceInport(device, port, value));
	}, [dispatch, device]);

	return (
		<Tabs.Panel value={ DeviceTab.MessagePorts } >
			<SectionTitle>Inputs</SectionTitle>
			{
				device.messageInputs.size ? <MessageInportList inports={ device.messageInputs } onSendMessage={ onSendMessage } /> : (
					<div className={ classes.emptySection }>
						This instance has no message inputs
					</div>
				)
			}
			<SectionTitle>Outputs</SectionTitle>
			{
				!device.messageOutputs.size ? (
					<div className={ classes.emptySection }>
						This instance has no message outputs
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
