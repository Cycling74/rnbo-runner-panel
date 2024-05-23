import { Tabs, Text } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { InstanceTab } from "../../lib/constants";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { SectionTitle } from "../page/sectionTitle";
import DataRefList from "../dataref/list";
import classes from "./instance.module.css";
import { InstanceStateRecord } from "../../models/instance";
import { setInstanceDataRefValueOnRemote } from "../../actions/instances";
import { DataRefRecord } from "../../models/dataref";
import { modals } from "@mantine/modals";
import { getDataFiles } from "../../selectors/datafiles";

export type InstanceDataRefTabProps = {
	instance: InstanceStateRecord;
}

const InstanceDataRefsTab: FunctionComponent<InstanceDataRefTabProps> = memo(function WrappedInstanceDataRefsTab({
	instance
}) {

	const dispatch = useAppDispatch();
	const datafiles = useAppSelector((state: RootStateType) => getDataFiles(state).toArray());

	const onSetDataRef = useCallback((dataref: DataRefRecord, fileName: string) => {
		dispatch(setInstanceDataRefValueOnRemote(instance, dataref, fileName.trim()));
	}, [dispatch, instance]);

	const onClearDataRef = useCallback((dataref: DataRefRecord) => {
		modals.openConfirmModal({
			title: "Clear Data Ref Mapping",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to clear the Data Ref Mapping for { `"${dataref.id}"` }?
				</Text>
			),
			labels: { confirm: "Clear", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => dispatch(setInstanceDataRefValueOnRemote(instance, dataref, ""))
		});
	}, [dispatch, instance]);

	return (
		<Tabs.Panel value={ InstanceTab.DataRefs } >
			<SectionTitle>Data Refs</SectionTitle>
			{
				!instance.datarefs.size ? (
					<div className={ classes.emptySection }>
						This patcher instance has no datarefs.
					</div>
				) : <DataRefList datarefs={ instance.datarefs } options={ datafiles } onSetDataRef={ onSetDataRef } onClearDataRef={ onClearDataRef } />
			}
		</Tabs.Panel>
	);
});

export default InstanceDataRefsTab;
