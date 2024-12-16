import { Stack, Text } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import DataRefList from "../dataref/list";
import classes from "./instance.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { setInstanceDataRefValueOnRemote } from "../../actions/instances";
import { DataRefRecord } from "../../models/dataref";
import { modals } from "@mantine/modals";
import { DataFileRecord } from "../../models/datafile";
import { Seq } from "immutable";

export type InstanceDataRefTabProps = {
	instance: PatcherInstanceRecord;
	datafiles: Seq.Indexed<DataFileRecord>;
}

const InstanceDataRefsTab: FunctionComponent<InstanceDataRefTabProps> = memo(function WrappedInstanceDataRefsTab({
	instance,
	datafiles
}) {

	const dispatch = useAppDispatch();

	const onSetDataRef = useCallback((dataref: DataRefRecord, file: DataFileRecord) => {
		dispatch(setInstanceDataRefValueOnRemote(instance, dataref, file));
	}, [dispatch, instance]);

	const onClearDataRef = useCallback((dataref: DataRefRecord) => {
		modals.openConfirmModal({
			title: "Clear Buffer Mapping",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to clear the Buffer Mapping for { `"${dataref.id}"` }?
				</Text>
			),
			labels: { confirm: "Clear", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => dispatch(setInstanceDataRefValueOnRemote(instance, dataref))
		});
	}, [dispatch, instance]);

	return (
		<Stack>
			{
				!instance.datarefs.size ? (
					<div className={ classes.emptySection }>
						This patcher instance has no buffers.
					</div>
				) : <DataRefList datarefs={ instance.datarefs } options={ datafiles } onSetDataRef={ onSetDataRef } onClearDataRef={ onClearDataRef } />
			}
		</Stack>
	);
});

export default InstanceDataRefsTab;
