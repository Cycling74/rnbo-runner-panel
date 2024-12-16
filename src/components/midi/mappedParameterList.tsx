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
	patcherInstances: ImmuMap<PatcherInstanceRecord["index"], PatcherInstanceRecord>;
	onClearParameterMidiMapping: (instance: PatcherInstanceRecord, param: ParameterRecord) => void;
	onSort: (sortAttr: MIDIMappedParameterSortAttr) => void;
	sortAttr: MIDIMappedParameterSortAttr;
	sortOrder: SortOrder;
};

const MIDIMappedParameterList: FC<MIDIMappedParameterListProps> = memo(function WrappedMIDIMappedParameterList({
	patcherInstances,
	parameters,
	onClearParameterMidiMapping,
	onSort,
	sortAttr,
	sortOrder
}) {

	return (
		<Table verticalSpacing="sm" maw="100%" layout="fixed" highlightOnHover>
			<Table.Thead>
				<Table.Tr>
					<TableHeaderCell
						className={ classes.midiChannelColumnHeader }
						fz="xs"
						onSort={ onSort }
						sortKey={ MIDIMappedParameterSortAttr.MIDIChannel }
						sortOrder={ sortOrder }
						sorted={ sortAttr === MIDIMappedParameterSortAttr.MIDIChannel }
					>
						Channel
					</TableHeaderCell>
					<TableHeaderCell
						className={ classes.midiControlColumnHeader }
						fz="xs"
						onSort={ onSort }
						sortKey={ MIDIMappedParameterSortAttr.MIDIControl }
						sortOrder={ sortOrder }
						sorted={ sortAttr === MIDIMappedParameterSortAttr.MIDIControl }
					>
						Control
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
						sortKey={ MIDIMappedParameterSortAttr.InstanceIndex }
						sortOrder={ sortOrder }
						sorted={ sortAttr === MIDIMappedParameterSortAttr.InstanceIndex }
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
						const pInstance = patcherInstances.get(p.instanceIndex);
						return pInstance
							?	<MIDIMappedParameter
									key={ p.id }
									instance={ pInstance }
									param={ p }
									onClearMIDIMapping={ onClearParameterMidiMapping }
								/>
							: null;
					})
				}
			</Table.Tbody>
		</Table>
	);
})

export default MIDIMappedParameterList;
