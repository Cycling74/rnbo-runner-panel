import { FunctionComponent, memo } from "react";
import DataRefEntry from "./item";
import { InstanceStateRecord } from "../../models/instance";
import { DataRefRecord } from "../../models/dataref";
import { Seq } from "immutable";
import { Table } from "@mantine/core";
import classes from "./datarefs.module.css";
import { DataFileRecord } from "../../models/datafile";

export type DataRefListProps = {
	onClearDataRef: (dataref: DataRefRecord) => any;
	onSetDataRef: (dataref: DataRefRecord, file: DataFileRecord) => any;
	datarefs: InstanceStateRecord["datarefs"];
	options: Seq.Indexed<DataFileRecord>; // soundfile list
}

const DataRefList: FunctionComponent<DataRefListProps> = memo(function WrappedDataRefList({
	onClearDataRef,
	onSetDataRef,
	datarefs,
	options
}) {
	return (
		<Table layout="fixed" className={ classes.dataRefTable } >
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Buffer</Table.Th>
					<Table.Th>File</Table.Th>
					<Table.Th style={{ width: 30 }} ></Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{
					datarefs.valueSeq().map(ref => (
						<DataRefEntry
							key={ ref.id }
							dataref={ ref }
							options={ options }
							onClear={ onClearDataRef }
							onUpdate={ onSetDataRef }
						/>
					))
				}
			</Table.Tbody>
		</Table>
	);
});

export default DataRefList;
