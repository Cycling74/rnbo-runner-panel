import { Stack } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import DataRefList from "../dataref/list";
import classes from "./instance.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { clearInstanceDataRefValueOnRemote, setInstanceDataRefValueOnRemote } from "../../actions/patchers";
import { DataRefRecord } from "../../models/dataref";
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
		dispatch(clearInstanceDataRefValueOnRemote(instance, dataref));
	}, [dispatch, instance]);

	return (
		<Stack>
			{
				!instance.datarefs.size ? (
					<div className={ classes.emptySection }>
						This device has no buffers.
					</div>
				) : <DataRefList datarefs={ instance.datarefs } options={ datafiles } onSetDataRef={ onSetDataRef } onClearDataRef={ onClearDataRef } />
			}
		</Stack>
	);
});

export default InstanceDataRefsTab;
