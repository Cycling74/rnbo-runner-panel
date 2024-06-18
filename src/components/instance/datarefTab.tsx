import { Tabs, Text } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { InstanceTab, SortOrder } from "../../lib/constants";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import DataRefList from "../dataref/list";
import classes from "./instance.module.css";
import { InstanceStateRecord } from "../../models/instance";
import { setInstanceDataRefValueOnRemote } from "../../actions/instances";
import { DataRefRecord } from "../../models/dataref";
import { modals } from "@mantine/modals";
import { getDataFilesSortedByName } from "../../selectors/datafiles";
import { RootStateType } from "../../lib/store";
import { DataFileRecord } from "../../models/datafile";

export type InstanceDataRefTabProps = {
	instance: InstanceStateRecord;
}

const InstanceDataRefsTab: FunctionComponent<InstanceDataRefTabProps> = memo(function WrappedInstanceDataRefsTab({
	instance
}) {

	const dispatch = useAppDispatch();
	const datafiles = useAppSelector((state: RootStateType) => getDataFilesSortedByName(state, SortOrder.Asc));

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
		<Tabs.Panel value={ InstanceTab.DataRefs } >
			{
				!instance.datarefs.size ? (
					<div className={ classes.emptySection }>
						This patcher instance has no buffers.
					</div>
				) : <DataRefList datarefs={ instance.datarefs } options={ datafiles } onSetDataRef={ onSetDataRef } onClearDataRef={ onClearDataRef } />
			}
		</Tabs.Panel>
	);
});

export default InstanceDataRefsTab;
