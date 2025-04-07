import { Map as ImmuMap, Seq } from "immutable";
import { Stack } from "@mantine/core";
import { FunctionComponent, memo, useCallback } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import DataRefList from "../dataref/list";
import classes from "./instance.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { clearInstanceDataRefValueOnRemote, restoreDefaultDataRefMetaOnRemote, setInstanceDataRefMetaOnRemote, setInstanceDataRefValueOnRemote } from "../../actions/patchers";
import { DataRefRecord } from "../../models/dataref";
import { DataFileRecord } from "../../models/datafile";

export type InstanceDataRefTabProps = {
	instance: PatcherInstanceRecord;
	datafiles: Seq.Indexed<DataFileRecord>;
	dataRefs: ImmuMap<DataRefRecord["id"], DataRefRecord>;
}

const InstanceDataRefsTab: FunctionComponent<InstanceDataRefTabProps> = memo(function WrappedInstanceDataRefsTab({
	instance,
	datafiles,
	dataRefs
}) {

	const dispatch = useAppDispatch();

	const onSetDataRef = useCallback((dataref: DataRefRecord, file: DataFileRecord) => {
		dispatch(setInstanceDataRefValueOnRemote(dataref, file));
	}, [dispatch]);

	const onClearDataRef = useCallback((dataref: DataRefRecord) => {
		dispatch(clearInstanceDataRefValueOnRemote(dataref));
	}, [dispatch]);

	const onSaveMetadata = useCallback((dataref: DataRefRecord, value: string) => {
		dispatch(setInstanceDataRefMetaOnRemote(dataref, value));
	}, [dispatch]);

	const onRestoreMetadata = useCallback((dataref: DataRefRecord) => {
		dispatch(restoreDefaultDataRefMetaOnRemote(dataref));
	}, [dispatch]);

	return (
		<Stack>
			{
				!dataRefs.size ? (
					<div className={ classes.emptySection }>
						This device has no buffers.
					</div>
				) : (
					<DataRefList
						dataRefs={ dataRefs }
						options={ datafiles }
						onSetDataRef={ onSetDataRef }
						onClearDataRef={ onClearDataRef }
						onRestoreMetadata={ onRestoreMetadata }
						onSaveMetadata={ onSaveMetadata }
					/>
				)
			}
		</Stack>
	);
});

export default InstanceDataRefsTab;
