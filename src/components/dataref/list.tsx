import { FunctionComponent, memo } from "react";
import classes from "./datarefs.module.css";
import DataRefEntry from "./item";
import { InstanceStateRecord } from "../../models/instance";

export type DataRefListProps = {
	datarefs: InstanceStateRecord["datarefs"];
	//XXX todo soundfile list
}

const DataRefList: FunctionComponent<DataRefListProps> = memo(function WrappedDataRefList({
	datarefs
}) {
	return (
		<div className={ classes.datarefList }>
			{
				datarefs.valueSeq().map(v => <DataRefEntry key={ v.id } id={ v.id } value={ v.value } />)
			}
		</div>
	);
});

export default DataRefList;
