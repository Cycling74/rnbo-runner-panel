import { Map as ImmuMap, Set as ImmuOrderedSet } from "immutable";
import { Table } from "@mantine/core";
import { FC, memo } from "react";
import classes from "./midi.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { ParameterRecord } from "../../models/parameter";
import MIDIMappedParameter from "./mappedParameterItem";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { MIDIMappedParameterSortAttr, SortOrder } from "../../lib/constants";

export type MIDIMappedParameterListProps = {
	parameters: ImmuOrderedSet<ParameterRecord>;
	patcherInstances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>;
	onClearParameterMIDIMapping: (param: ParameterRecord) => void;
	onUpdateParameterMIDIMapping: (param: ParameterRecord, value: string) => void;
	onSort: (sortAttr: MIDIMappedParameterSortAttr) => void;
	sortAttr: MIDIMappedParameterSortAttr;
	sortOrder: SortOrder;
};

const MIDIMappedParameterList: FC<MIDIMappedParameterListProps> = memo(function WrappedMIDIMappedParameterList({
	patcherInstances,
	parameters,
	onClearParameterMIDIMapping,
	onUpdateParameterMIDIMapping,
	onSort,
	sortAttr,
	sortOrder
}) {

	return (
		<Table verticalSpacing="sm" maw="100%" layout="fixed" highlightOnHover>
			<Table.Thead>
				<Table.Tr>
					<TableHeaderCell
						className={ classes.midiSourceColumnHeader }
						fz="xs"
						onSort={ onSort }
						sortKey={ MIDIMappedParameterSortAttr.MIDISource }
						sortOrder={ sortOrder }
						sorted={ sortAttr === MIDIMappedParameterSortAttr.MIDISource }
					>
						Source
					</TableHeaderCell>
					<TableHeaderCell
						className={ classes.parameterNameColumnHeader }
						fz="xs"
						onSort={ onSort }
						sortKey={ MIDIMappedParameterSortAttr.ParameterName }
						sortOrder={ sortOrder }
						sorted={ sortAttr === MIDIMappedParameterSortAttr.ParameterName }
					>
						Parameter
					</TableHeaderCell>
					<TableHeaderCell
						className={ classes.patcherInstanceColumnHeader }
						fz="xs"
						onSort={ onSort }
						sortKey={ MIDIMappedParameterSortAttr.InstanceId }
						sortOrder={ sortOrder }
						sorted={ sortAttr === MIDIMappedParameterSortAttr.InstanceId }
					>
						Instance
					</TableHeaderCell>
					<TableHeaderCell className={ classes.parameterValueColumnHeader } fz="xs" >
						Current Value
					</TableHeaderCell>
					<TableHeaderCell className={ classes.actionColumnHeader } />
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{
					parameters.map(p => {
						const pInstance = patcherInstances.get(p.instanceId);
						if (!pInstance) return null;
						return (
							<MIDIMappedParameter
								key={ p.id }
								instance={ pInstance }
								param={ p }
								onClearMIDIMapping={ onClearParameterMIDIMapping }
								onUpdateMIDIMapping={ onUpdateParameterMIDIMapping }
							/>
						);
					})
				}
			</Table.Tbody>
		</Table>
	);
});

export default MIDIMappedParameterList;
