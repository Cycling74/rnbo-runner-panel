import { Map as ImmuMap } from "immutable";
import { FunctionComponent, memo, useCallback, useState } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import MessageInportList from "../messages/inportList";
import classes from "./instance.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { triggerSendInstanceInportMessage, sendInstanceInportBang } from "../../actions/patchers";
import { MessagePortRecord } from "../../models/messageport";
import { restoreDefaultMessagePortMetaOnRemote, setInstanceMessagePortMetaOnRemote } from "../../actions/patchers";
import { Group, Stack } from "@mantine/core";
import { SearchInput } from "../page/searchInput";

export type InstanceInportTabProps = {
	instance: PatcherInstanceRecord;
	messageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
}

const InstanceInportTab: FunctionComponent<InstanceInportTabProps> = memo(function WrappedInstanceMessagesTab({
	instance,
	messageInports
}) {

	const dispatch = useAppDispatch();
	const [searchValue, setSearchValue] = useState<string>("");

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
		<Stack gap="xs">
			<Group justify="flex-end">
				<SearchInput onSearch={ setSearchValue } />
			</Group>
			{
				!messageInports.size ? (
					<div className={ classes.emptySection }>
						This device has no inports.
					</div>
				) :
					<MessageInportList
						inports={ messageInports.valueSeq().filter(p => p.matchesQuery(searchValue)) }
						onSendBang={ onSendInportBang }
						onSendMessage={ onSendInportMessage }
						onRestoreMetadata={ onRestoreDefaultPortMetadata }
						onSaveMetadata={ onSavePortMetadata }
					/>
			}
		</Stack>
	);
});

export default InstanceInportTab;
