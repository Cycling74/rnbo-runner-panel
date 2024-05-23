import { Tabs } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { InstanceTab } from "../../lib/constants";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { SectionTitle } from "../page/sectionTitle";
import DataRefList from "../dataref/list";
import classes from "./instance.module.css";
import { InstanceStateRecord } from "../../models/instance";

export type InstanceDataRefTabProps = {
	instance: InstanceStateRecord;
}

const InstanceDataRefsTab: FunctionComponent<InstanceDataRefTabProps> = memo(function WrappedInstanceDataRefsTab({
	instance
}) {

	const dispatch = useAppDispatch();

	const onSendInportDataRef = useCallback((id: string, value: string) => {
		//TODO dispatch(sendInstanceDataRefToRemote(instance, id, value));
	}, [dispatch, instance]);

	return (
		<Tabs.Panel value={ InstanceTab.DataRefs } >
			<SectionTitle>Data Refs</SectionTitle>
			{
				!instance.datarefs.size ? (
					<div className={ classes.emptySection }>
						This patcher instance has no datarefs.
					</div>
				) : <DataRefList datarefs={ instance.datarefs } />
			}
		</Tabs.Panel>
	);
});

export default InstanceDataRefsTab;
