import { OrderedSet as ImmuOrderedSet, Map as ImmuMap } from "immutable";
import { Stack } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import classes from "../components/midi/midi.module.css";
import { MIDIMappedItemSortAttr, MIDIMetaMappingType, SortOrder } from "../lib/constants";
import { FC, useCallback, useEffect, useState } from "react";
import { getPatcherInstanceItemsWithMIDIMapping, getPatcherInstances } from "../selectors/patchers";
import MIDIMappedItemList from "../components/midi/mappedItemList";
import { ParameterRecord } from "../models/parameter";
import { MessagePortRecord } from "../models/messageport";
import { clearItemMIDIMappingOnRemote, setItemMIDIMappingOnRemoteFromDisplayValue } from "../actions/patchers";
import { formatMIDIMappingToDisplay } from "../lib/util";
import { PageTitle } from "../components/page/title";

const collator = new Intl.Collator("en-US", { numeric: true });

type MappedItem = ParameterRecord | MessagePortRecord;

const itemComparators: Record<MIDIMappedItemSortAttr, Record<SortOrder, (a: MappedItem, b: MappedItem) => number>> = {
	[MIDIMappedItemSortAttr.MIDISource]: {
		[SortOrder.Asc]: (a: MappedItem, b: MappedItem) => {
			const aDisplay = formatMIDIMappingToDisplay(a.midiMappingType as MIDIMetaMappingType, a.meta.midi);
			const bDisplay = formatMIDIMappingToDisplay(b.midiMappingType as MIDIMetaMappingType, b.meta.midi);
			return collator.compare(aDisplay, bDisplay);
		},
		[SortOrder.Desc]: (a: MappedItem, b: MappedItem) => {
			const aDisplay = formatMIDIMappingToDisplay(a.midiMappingType as MIDIMetaMappingType, a.meta.midi);
			const bDisplay = formatMIDIMappingToDisplay(b.midiMappingType as MIDIMetaMappingType, b.meta.midi);
			return collator.compare(aDisplay, bDisplay) * -1;
		}
	},
	[MIDIMappedItemSortAttr.InstanceId]: {
		[SortOrder.Asc]: (a: MappedItem, b: MappedItem) => {
			if (a.instanceId !== b.instanceId) return collator.compare(a.instanceId, b.instanceId);
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: MappedItem, b: MappedItem) => {
			if (a.instanceId !== b.instanceId) return collator.compare(a.instanceId, b.instanceId) * -1;
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase()) * -1;
		}
	},
	[MIDIMappedItemSortAttr.Name]: {
		[SortOrder.Asc]: (a: MappedItem, b: MappedItem) => {
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: MappedItem, b: MappedItem) => {
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase()) * -1;
		}
	}
};

const getSortedItemIds = (items: ImmuMap<MappedItem["id"], MappedItem>, attr: MIDIMappedItemSortAttr, order: SortOrder): ImmuOrderedSet<MappedItem["id"]> => {
	return ImmuOrderedSet<MappedItem["id"]>(items.valueSeq().sort(itemComparators[attr][order]).map(p => p.id));
};

export const MIDIMappingsPage: FC<Record<never, never>> = () => {

	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);
	const [sortAttr, setSortAttr] = useState<MIDIMappedItemSortAttr>(MIDIMappedItemSortAttr.MIDISource);
	const [sortedItemIds, setSortedItemIds] = useState<ImmuOrderedSet<MappedItem["id"]>>(ImmuOrderedSet<MappedItem["id"]>());

	const dispatch = useAppDispatch();
	const [
		patcherInstances,
		items
	] = useAppSelector((state: RootStateType) => [
		getPatcherInstances(state),
		getPatcherInstanceItemsWithMIDIMapping(state)
	]);

	const onClearMIDIMapping = useCallback((item: ParameterRecord | MessagePortRecord) => {
		dispatch(clearItemMIDIMappingOnRemote(item));
	}, [dispatch]);

	const onUpdateMIDIMapping = useCallback((item: ParameterRecord | MessagePortRecord, value: string) => {
		dispatch(setItemMIDIMappingOnRemoteFromDisplayValue(item, value));
	}, [dispatch]);

	const onSort = useCallback((attr: MIDIMappedItemSortAttr): void => {
		if (attr === sortAttr) return void setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);

		setSortAttr(attr);
		setSortOrder(SortOrder.Asc);

	}, [sortOrder, sortAttr, setSortOrder, setSortAttr]);

	useEffect(() => {
		setSortedItemIds(getSortedItemIds(items, sortAttr, sortOrder));
	}, [patcherInstances, items, sortAttr, sortOrder]);

	const displayItems = ImmuOrderedSet<MappedItem>().withMutations(set => {
		sortedItemIds.forEach(id => {
			const p = items.get(id);
			if (p) set.add(p);
		});
	});

	return (
		<Stack className={ classes.midiMappingsWrap } >
			<PageTitle>MIDI Mappings</PageTitle>
			<MIDIMappedItemList
				patcherInstances={ patcherInstances }
				items={ displayItems }
				onClearMIDIMapping={ onClearMIDIMapping }
				onUpdateMIDIMapping={ onUpdateMIDIMapping }
				onSort={ onSort }
				sortAttr={ sortAttr }
				sortOrder={ sortOrder }
			/>
		</Stack>
	);
};
