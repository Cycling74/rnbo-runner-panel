import { FunctionComponent, memo } from "react";
import { Map as ImmuMap } from "immutable";
import DataRefEntry from "./item";
import { DataRefRecord } from "../../models/dataref";
import { Seq } from "immutable";
import { Table } from "@mantine/core";
import classes from "./datarefs.module.css";
import { DataFileRecord } from "../../models/datafile";

export type DataRefListProps = {
	onClearDataRef: (dataref: DataRefRecord) => void;
	onSetDataRef: (dataref: DataRefRecord, file: DataFileRecord) => void;
	onRestoreMetadata: (dataref: DataRefRecord) => void;
	onSaveMetadata: (dataref: DataRefRecord, meta: string) => void;
	onExportDataRef: (dataref: DataRefRecord) => void;
	dataRefs: ImmuMap<DataRefRecord["id"], DataRefRecord>;
	options: Seq.Indexed<DataFileRecord>; // soundfile list
}

const DataRefList: FunctionComponent<DataRefListProps> = memo(function WrappedDataRefList({
	onClearDataRef,
	onSetDataRef,
	dataRefs,
	options,
	onSaveMetadata,
	onRestoreMetadata,
	onExportDataRef
}) {

	return (
		<Table layout="fixed" className={ classes.dataRefTable } verticalSpacing="sm" maw="100%" highlightOnHover>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>Buffer</Table.Th>
					<Table.Th>File</Table.Th>
					<Table.Th w={ 60 }></Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{
					dataRefs.valueSeq().map(ref => (
						<DataRefEntry
							key={ ref.id }
							dataRef={ ref }
							options={ options }
							onClear={ onClearDataRef }
							onUpdate={ onSetDataRef }
							onRestoreMetadata={ onRestoreMetadata }
							onSaveMetadata={ onSaveMetadata }
							onExport={ onExportDataRef }
						/>
					))
				}
			</Table.Tbody>
		</Table>
	);
});

export default DataRefList;
