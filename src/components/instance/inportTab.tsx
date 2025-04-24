import { Map as ImmuMap } from "immutable";
import { FunctionComponent, memo, useCallback } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import MessageInportList from "../messages/inportList";
import classes from "./instance.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { triggerSendInstanceInportMessage, sendInstanceInportBang } from "../../actions/patchers";
import { MessagePortRecord } from "../../models/messageport";
import { restoreDefaultMessagePortMetaOnRemote, setInstanceMessagePortMetaOnRemote } from "../../actions/patchers";

export type InstanceInportTabProps = {
	instance: PatcherInstanceRecord;
	messageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
}

const InstanceInportTab: FunctionComponent<InstanceInportTabProps> = memo(function WrappedInstanceMessagesTab({
	instance,
	messageInports
}) {

	const dispatch = useAppDispatch();
	const onSendInportMessage = useCallback((port: MessagePortRecord) => {
		dispatch(triggerSendInstanceInportMessage(instance, port));
	}, [dispatch, instance]);

	const onSendInportBang = useCallback((port: MessagePortRecord) => {
		dispatch(sendInstanceInportBang(instance, port));
	}, [dispatch, instance]);

	const onSavePortMetadata = useCallback((port: MessagePortRecord, meta: string) => {
		dispatch(setInstanceMessagePortMetaOnRemote(instance, port, meta));
	}, [dispatch, instance]);

	const onRestoreDefaultPortMetadata = useCallback((port: MessagePortRecord) => {
		dispatch(restoreDefaultMessagePortMetaOnRemote(instance, port));
	}, [dispatch, instance]);

	return (
		!messageInports.size ? (
			<div className={ classes.emptySection }>
				This device has no message inports.
			</div>
		) :
			<MessageInportList
				inports={ messageInports.valueSeq() }
				onSendBang={ onSendInportBang }
				onSendMessage={ onSendInportMessage }
				onRestoreMetadata={ onRestoreDefaultPortMetadata }
				onSaveMetadata={ onSavePortMetadata }
			/>
	);
});

export default InstanceInportTab;
