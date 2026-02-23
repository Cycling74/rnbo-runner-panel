import { Map as ImmuMap, Set as ImmuOrderedSet } from "immutable";
import { Table } from "@mantine/core";
import { FC, memo } from "react";
import classes from "./midi.module.css";
import { PatcherInstanceRecord } from "../../models/instance";
import { ParameterRecord } from "../../models/parameter";
import MIDIMappedItem from "./mappedItem";
import { TableHeaderCell } from "../elements/tableHeaderCell";
import { MIDIMappedItemSortAttr, SortOrder } from "../../lib/constants";
import { MessagePortRecord } from "../../models/messageport";

export type MIDIMappedItemListProps = {
	items: ImmuOrderedSet<ParameterRecord | MessagePortRecord>;
	patcherInstances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>;
	onClearMIDIMapping: (param: ParameterRecord | MessagePortRecord) => void;
	onUpdateMIDIMapping: (param: ParameterRecord | MessagePortRecord, value: string) => void;
	onSort: (sortAttr: MIDIMappedItemSortAttr) => void;
	sortAttr: MIDIMappedItemSortAttr;
	sortOrder: SortOrder;
};

const MIDIMappedItemList: FC<MIDIMappedItemListProps> = memo(function WrappedMIDIMappedParameterList({
	patcherInstances,
	items,
	onClearMIDIMapping,
	onUpdateMIDIMapping,
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
						onSort={ onSort }
						sortKey={ MIDIMappedItemSortAttr.MIDISource }
						sortOrder={ sortOrder }
						sorted={sortAttr === MIDIMappedItemSortAttr.MIDISource }
					>
						Source
					</TableHeaderCell>
					<TableHeaderCell
						className={ classes.destinationNameColumnHeader }
						onSort={ onSort }
						sortKey={ MIDIMappedItemSortAttr.Name }
						sortOrder={ sortOrder }
						sorted={sortAttr === MIDIMappedItemSortAttr.Name }
					>
						Destination
					</TableHeaderCell>
					<TableHeaderCell
						className={ classes.patcherInstanceColumnHeader }
						onSort={ onSort }
						sortKey={MIDIMappedItemSortAttr.InstanceId }
						sortOrder={ sortOrder }
						sorted={sortAttr === MIDIMappedItemSortAttr.InstanceId }
					>
						Device
					</TableHeaderCell>
					<TableHeaderCell className={classes.destinationValueColumnHeader } >
						Value
					</TableHeaderCell>
					<TableHeaderCell className={ classes.actionColumnHeader } />
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{
					items.map(i => {
						const pInstance = patcherInstances.get(i.instanceId);
						if (!pInstance) return null;
						return (
							<MIDIMappedItem
								key={ i.id }
								instance={ pInstance }
								item={ i }
								onClearMIDIMapping={ onClearMIDIMapping }
								onUpdateMIDIMapping={ onUpdateMIDIMapping }
							/>
						);
					})
				}
			</Table.Tbody>
		</Table>
	);
});

export default MIDIMappedItemList;
