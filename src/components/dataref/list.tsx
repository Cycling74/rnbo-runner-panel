import { FunctionComponent, memo, useCallback } from "react";
import classes from "./datarefs.module.css";
import DataRefEntry from "./item";
import { InstanceStateRecord } from "../../models/instance";
import { DataRefRecord } from "../../models/dataref";

export type DataRefListProps = {
	onClearDataRef: (dataref: DataRefRecord) => any;
	onSetDataRef: (dataref: DataRefRecord, fileName: string) => any;
	datarefs: InstanceStateRecord["datarefs"];
	options: string[]; // soundfile list
}

const DataRefList: FunctionComponent<DataRefListProps> = memo(function WrappedDataRefList({
	onClearDataRef,
	onSetDataRef,
	datarefs,
	options
}) {
	return (
		<div className={ classes.datarefList }>
			{
				datarefs.valueSeq().map(dataref => <DataRefEntry key={ dataref.id } dataref={ dataref } options={ options } onClear={ onClearDataRef } onUpdate={ onSetDataRef } />)
			}
		</div>
	);
});

export default DataRefList;