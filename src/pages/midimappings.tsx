import { OrderedSet as ImmuOrderedSet, Map as ImmuMap } from "immutable";
import { Stack } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import classes from "../components/midi/midi.module.css";
import { MIDIMappedParameterSortAttr, SortOrder } from "../lib/constants";
import { useCallback, useEffect, useState } from "react";
import { getPatcherInstanceParametersWithMIDIMapping, getPatcherInstancesByIndex } from "../selectors/patchers";
import MIDIMappedParameterList from "../components/midi/mappedParameterList";
import { ParameterRecord } from "../models/parameter";
import { clearParameterMidiMappingOnRemote } from "../actions/patchers";
import { PatcherInstanceRecord } from "../models/instance";

const collator = new Intl.Collator("en-US");
const parameterComparators: Record<MIDIMappedParameterSortAttr, Record<SortOrder, (a: ParameterRecord, b: ParameterRecord) => number>> = {
	[MIDIMappedParameterSortAttr.MIDIChannel]: {
		[SortOrder.Asc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.meta.midi?.chan < b.meta.midi?.chan) return -1;
			if (a.meta.midi?.chan > b.meta.midi?.chan) return 1;
			if (a.meta.midi?.ctrl < b.meta.midi?.ctrl) return -1;
			if (a.meta.midi?.ctrl > b.meta.midi?.ctrl) return 1;
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.meta.midi?.chan > b.meta.midi?.chan) return -1;
			if (a.meta.midi?.chan < b.meta.midi?.chan) return 1;
			if (a.meta.midi?.ctrl > b.meta.midi?.ctrl) return -1;
			if (a.meta.midi?.ctrl < b.meta.midi?.ctrl) return 1;

			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase()) * -1;
		}
	},
	[MIDIMappedParameterSortAttr.MIDIControl]: {
		[SortOrder.Asc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.meta.midi?.ctrl < b.meta.midi?.ctrl) return -1;
			if (a.meta.midi?.ctrl > b.meta.midi?.ctrl) return 1;
			if (a.meta.midi?.chan < b.meta.midi?.chan) return -1;
			if (a.meta.midi?.chan > b.meta.midi?.chan) return 1;
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.meta.midi?.ctrl > b.meta.midi?.ctrl) return -1;
			if (a.meta.midi?.ctrl < b.meta.midi?.ctrl) return 1;
			if (a.meta.midi?.chan > b.meta.midi?.chan) return -1;
			if (a.meta.midi?.chan < b.meta.midi?.chan) return 1;

			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase()) * -1;
		}
	},
	[MIDIMappedParameterSortAttr.InstanceIndex]: {
		[SortOrder.Asc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.instanceIndex < b.instanceIndex) return -1;
			if (a.instanceIndex > b.instanceIndex) return 1;
			return collator.compare(a.name.toLowerCase(), b.name.toLowerCase());
		},
		[SortOrder.Desc]: (a: ParameterRecord, b: ParameterRecord) => {
			if (a.instanceIndex > b.instanceIndex) return -1;
			if (a.instanceIndex < b.instanceIndex) return 1;
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
	const [sortAttr, setSortAttr] = useState<MIDIMappedParameterSortAttr>(MIDIMappedParameterSortAttr.MIDIChannel);
	const [sortedParameterIds, setSortedParameterIds] = useState<ImmuOrderedSet<ParameterRecord["id"]>>(ImmuOrderedSet<ParameterRecord["id"]>());

	const dispatch = useAppDispatch();
	const [
		patcherInstances,
		parameters
	] = useAppSelector((state: RootStateType) => [
		getPatcherInstancesByIndex(state),
		getPatcherInstanceParametersWithMIDIMapping(state)
	]);

	const onClearParameterMidiMapping = useCallback((instance: PatcherInstanceRecord, param: ParameterRecord) => {
		dispatch(clearParameterMidiMappingOnRemote(instance.id, param.id));
	}, [dispatch]);

	const onSort = useCallback((attr: MIDIMappedParameterSortAttr) => {
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
				onClearParameterMidiMapping={ onClearParameterMidiMapping }
				onSort={ onSort }
				sortAttr={ sortAttr }
				sortOrder={ sortOrder }
			/>
		</Stack>
	);
};

export default MIDIMappings;
