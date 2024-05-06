import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { InstanceTab } from "../../lib/constants";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import MessageInportList from "../messages/inportList";
import { SectionTitle } from "../page/sectionTitle";
import MessageOutportList from "../messages/outportList";
import classes from "./instance.module.css";
import { InstanceStateRecord } from "../../models/instance";
import { sendInstanceMessageToRemote } from "../../actions/instances";

export type InstanceMessageTabProps = {
	instance: InstanceStateRecord;
	outputEnabled: boolean;
}

const InstanceMessagesTab: FunctionComponent<InstanceMessageTabProps> = memo(function WrappedInstanceMessagesTab({
	instance,
	outputEnabled
}) {

	const dispatch = useAppDispatch();
	const onSendInportMessage = useCallback((id: string, value: string) => {
		dispatch(sendInstanceMessageToRemote(instance, id, value));
	}, [dispatch, instance]);

	return (
		<Tabs.Panel value={ InstanceTab.MessagePorts } >
			<SectionTitle>Input Ports</SectionTitle>
			{
				instance.messageInputs.size ? <MessageInportList inports={ instance.messageInputs } onSendMessage={ onSendInportMessage } /> : (
					<div className={ classes.emptySection }>
						This patcher instance has no message input ports.
					</div>
				)
			}
			<SectionTitle>Output Ports</SectionTitle>
			{
				!instance.messageOutputs.size ? (
					<div className={ classes.emptySection }>
						This patcher instance has no output ports.
					</div>
				) : !outputEnabled ? (
					<div className={ classes.disabledMessageOutput } >
						Output port monitoring is currently disabled. Enable it in the settings in order to display the output values.
					</div>
				) : <MessageOutportList outports={ instance.messageOutputs } />
			}
		</Tabs.Panel>
	);
});

export default InstanceMessagesTab;
