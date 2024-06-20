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
import { restoreDefaultMessagePortMetaOnRemote, setInstanceMessagePortMetaOnRemote } from "../../actions/instances";

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

	const onSaveOutportMetadata = useCallback((port: MessagePortRecord, meta: string) => {
		dispatch(setInstanceMessagePortMetaOnRemote(instance, port, meta));
	}, [dispatch, instance]);

	const onRestoreDefaultOutportMetadata = useCallback((port: MessagePortRecord) => {
		dispatch(restoreDefaultMessagePortMetaOnRemote(instance, port));
	}, [dispatch, instance]);

	return (
		<Tabs.Panel value={ InstanceTab.MessagePorts } >
			<SectionTitle>Input Ports</SectionTitle>
			{
				instance.messageInports.size ? <MessageInportList inports={ instance.messageInports.valueSeq() } onSendMessage={ onSendInportMessage } /> : (
					<div className={ classes.emptySection }>
						This patcher instance has no message input ports.
					</div>
				)
			}
			<SectionTitle>Output Ports</SectionTitle>
			{
				!instance.messageOutports.size ? (
					<div className={ classes.emptySection }>
						This patcher instance has no output ports.
					</div>
				) :
				<MessageOutportList
					outports={ instance.messageOutports.valueSeq() }
					outputEnabled={ outputEnabled }
					onRestoreMetadata={ onRestoreDefaultOutportMetadata }
					onSaveMetadata={ onSaveOutportMetadata }
				/>
			}
		</Tabs.Panel>
	);
});

export default InstanceMessagesTab;
