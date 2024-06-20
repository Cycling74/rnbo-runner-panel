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
import { MessagePortRecord } from "../../models/messageport";

export type InstanceMessageTabProps = {
	instance: InstanceStateRecord;
	outputEnabled: boolean;
}

const InstanceMessagesTab: FunctionComponent<InstanceMessageTabProps> = memo(function WrappedInstanceMessagesTab({
	instance,
	outputEnabled
}) {

	const dispatch = useAppDispatch();
	const onSendInportMessage = useCallback((port: MessagePortRecord, value: string) => {
		dispatch(sendInstanceMessageToRemote(instance, port.id, value));
	}, [dispatch, instance]);

	return (
		<Tabs.Panel value={ InstanceTab.MessagePorts } >
			<SectionTitle>Input Ports</SectionTitle>
			{
				instance.messageInputs.size ? <MessageInportList inports={ instance.messageInputs.valueSeq() } onSendMessage={ onSendInportMessage } /> : (
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
				) :
				<MessageOutportList outports={ instance.messageOutputs.valueSeq() } outputEnabled={ outputEnabled }/>
			}
		</Tabs.Panel>
	);
});

export default InstanceMessagesTab;
