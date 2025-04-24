import { Map as ImmuMap } from "immutable";
import { FunctionComponent, memo, useCallback } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import MessageOutportList from "../messages/outportList";
import classes from "./instance.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { MessagePortRecord } from "../../models/messageport";
import { restoreDefaultMessagePortMetaOnRemote, setInstanceMessagePortMetaOnRemote } from "../../actions/patchers";
import { Center, Group, SegmentedControl, Stack, Tooltip } from "@mantine/core";
import { IconElement } from "../elements/icon";
import { mdiEye, mdiEyeOff } from "@mdi/js";
import { setAppSetting } from "../../actions/settings";
import { AppSetting } from "../../models/settings";

export type InstanceOutportTabProps = {
	instance: PatcherInstanceRecord;
	messageOutports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	outputEnabled: boolean;
}

const InstanceOutportTab: FunctionComponent<InstanceOutportTabProps> = memo(function WrappedInstanceMessagesTab({
	instance,
	messageOutports,
	outputEnabled
}) {

	const dispatch = useAppDispatch();

	const onSavePortMetadata = useCallback((port: MessagePortRecord, meta: string) => {
		dispatch(setInstanceMessagePortMetaOnRemote(instance, port, meta));
	}, [dispatch, instance]);

	const onRestoreDefaultPortMetadata = useCallback((port: MessagePortRecord) => {
		dispatch(restoreDefaultMessagePortMetaOnRemote(instance, port));
	}, [dispatch, instance]);

	const onSetOutportMonitoring = useCallback((v: string) => {
		dispatch(setAppSetting(AppSetting.debugMessageOutput, v === "true"));
	}, [dispatch]);

	return (
		<Stack gap="xs">
			<Group justify="flex-end">
				<SegmentedControl
					size="xs"
					color="blue"
					data={[
						{
							value: "false",
							label: (
								<Tooltip label="Disable Outport Monitoring" disabled={ !outputEnabled }>
									<Center><IconElement path={ mdiEyeOff } /></Center>
								</Tooltip>
							)
						},
						{
							value: "true",
							label: (
								<Tooltip label="Enable Outport Monitoring" disabled={ outputEnabled }>
									<Center><IconElement path={ mdiEye } /></Center>
								</Tooltip>
							)
						}
					]}
					onChange={ onSetOutportMonitoring }
					value={ `${outputEnabled}` }
				/>
			</Group>
			{
				!messageOutports.size ? (
					<div className={ classes.emptySection }>
						This device has no outports.
					</div>
				) :
					<MessageOutportList
						outports={ messageOutports.valueSeq() }
						outputEnabled={ outputEnabled }
						onRestoreMetadata={ onRestoreDefaultPortMetadata }
						onSaveMetadata={ onSavePortMetadata }
					/>
			}
		</Stack>
	);
});

export default InstanceOutportTab;
