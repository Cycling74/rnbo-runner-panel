import { OrderedSet as ImmuOrderedSet, Map as ImmuMap } from "immutable";
import { Stack } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import classes from "../components/midi/midi.module.css";
import { MIDIMappedParameterSortAttr, MIDIMetaMappingType, SortOrder } from "../lib/constants";
import { useCallback, useEffect, useState } from "react";
import { getPatcherInstanceParametersWithMIDIMapping, getPatcherInstances } from "../selectors/patchers";
import MIDIMappedParameterList from "../components/midi/mappedParameterList";
import { ParameterRecord } from "../models/parameter";
import { clearParameterMIDIMappingOnRemote, setParameterMIDIMappingOnRemoteFromDisplayValue } from "../actions/patchers";
import { formatMIDIMappingToDisplay } from "../lib/util";

const collator = new Intl.Collator("en-US", { numeric: true });

const parameterComparators: Record<MIDIMappedParameterSortAttr, Record<SortOrder, (a: ParameterRecord, b: ParameterRecord) => number>> = {
	[MIDIMappedParameterSortAttr.MIDISource]: {
		[SortOrder.Asc]: (a: ParameterRecord, b: ParameterRecord) => {
			const aDisplay = formatMIDIMappingToDisplay(a.midiMappingType as MIDIMetaMappingType, a.meta.midi);
			const bDisplay = formatMIDIMappingToDisplay(b.midiMappingType as MIDIMetaMappingType, b.meta.midi);
			return collator.compare(aDisplay, bDisplay);
		},
		[SortOrder.Desc]: (a: ParameterRecord, b: ParameterRecord) => {
			const aDisplay = formatMIDIMappingToDisplay(a.midiMappingType as MIDIMetaMappingType, a.meta.midi);
			const bDisplay = formatMIDIMappingToDisplay(b.midiMappingType as MIDIMetaMappingType, b.meta.midi);
			return collator.compare(aDisplay, bDisplay) * -1;
		}
	},
	[MIDIMappedParameterSortAttr.InstanceId]: {
		[SortOrder.Asc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.instanceId !== b.instanceId) return collator.compare(a.instanceId, b.instanceId);
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.instanceId !== b.instanceId) return collator.compare(a.instanceId, b.instanceId) * -1;
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase()) * -1;
		}
	},
	[MIDIMappedParameterSortAttr.ParameterName]: {
		[SortOrder.Asc]: (a: ParameterRecord, b: ParameterRecord) => {
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: ParameterRecord, b: ParameterRecord) => {
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase()) * -1;
		}
	}
};

const getSortedParameterIds = (params: ImmuMap<ParameterRecord["id"], ParameterRecord>, attr: MIDIMappedParameterSortAttr, order: SortOrder): ImmuOrderedSet<ParameterRecord["id"]> => {
	return ImmuOrderedSet<ParameterRecord["id"]>(params.valueSeq().sort(parameterComparators[attr][order]).map(p => p.id));
};

const MIDIMappings = () => {

	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);
	const [sortAttr, setSortAttr] = useState<MIDIMappedParameterSortAttr>(MIDIMappedParameterSortAttr.MIDISource);
	const [sortedParameterIds, setSortedParameterIds] = useState<ImmuOrderedSet<ParameterRecord["id"]>>(ImmuOrderedSet<ParameterRecord["id"]>());

	const dispatch = useAppDispatch();
	const [
		patcherInstances,
		parameters
	] = useAppSelector((state: RootStateType) => [
		getPatcherInstances(state),
		getPatcherInstanceParametersWithMIDIMapping(state)
	]);

	const onClearParameterMIDIMapping = useCallback((param: ParameterRecord) => {
		dispatch(clearParameterMIDIMappingOnRemote(param));
	}, [dispatch]);

	const onUpdateParameterMIDIMapping = useCallback((param: ParameterRecord, value: string) => {
		dispatch(setParameterMIDIMappingOnRemoteFromDisplayValue(param, value));
	}, [dispatch]);

	const onSort = useCallback((attr: MIDIMappedParameterSortAttr): void => {
		if (attr === sortAttr) return void setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);

		setSortAttr(attr);
		setSortOrder(SortOrder.Asc);

	}, [sortOrder, sortAttr, setSortOrder, setSortAttr]);

	useEffect(() => {
		setSortedParameterIds(getSortedParameterIds(parameters, sortAttr, sortOrder));
	}, [patcherInstances, parameters.size, sortAttr, sortOrder]);

	const displayParameters = ImmuOrderedSet<ParameterRecord>().withMutations(set => {
		sortedParameterIds.forEach(id => {
			const p = parameters.get(id);
			if (p) set.add(p);
		});
	});

	return (
		<Stack className={ classes.midiMappingsWrap } >
			<MIDIMappedParameterList
				patcherInstances={ patcherInstances }
				parameters={ displayParameters }
				onClearParameterMIDIMapping={ onClearParameterMIDIMapping }
				onUpdateParameterMIDIMapping={ onUpdateParameterMIDIMapping }
				onSort={ onSort }
				sortAttr={ sortAttr }
				sortOrder={ sortOrder }
			/>
		</Stack>
	);
};

export default MIDIMappings;
