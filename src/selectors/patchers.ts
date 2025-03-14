import { Map as ImmuMap, Seq, OrderedSet as ImmuOrderedSet } from "immutable";
import { RootStateType } from "../lib/store";
import { PatcherInstanceRecord } from "../models/instance";
import { createSelector } from "reselect";
import { ParameterRecord } from "../models/parameter";
import { MessagePortRecord } from "../models/messageport";
import { PatcherExportRecord } from "../models/patcher";
import { SortOrder } from "../lib/constants";
import { GraphSetViewRecord } from "../models/set";

export const getPatcherExports = (state: RootStateType): ImmuMap<PatcherExportRecord["id"], PatcherExportRecord> => {
	return state.patchers.exports;
};

export const getPatcherExport = createSelector(
	[
		getPatcherExports,
		(state: RootStateType, name: string): string => name
	],
	(patchers, name): PatcherExportRecord | undefined => {
		return patchers.get(name);
	}
);

export const getPatchersSortedByName = createSelector(
	[
		getPatcherExports,
		(state: RootStateType, order: SortOrder): SortOrder => order
	],
	(patchers, order): Seq.Indexed<PatcherExportRecord> => {
		const collator = new Intl.Collator("en-US");
		return patchers.valueSeq().sort((pA, pB) => {
			return collator.compare(pA.name.toLowerCase(), pB.name.toLowerCase()) * (order === SortOrder.Asc ? 1 : -1);
		});
	}
);


export const getPatcherInstances = (state: RootStateType): ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord> => state.patchers.instances;

export const getPatcherInstance = createSelector(
	[
		getPatcherInstances,
		(state: RootStateType, id: PatcherInstanceRecord["id"]): PatcherInstanceRecord["id"] => id
	],
	(instances, id): PatcherInstanceRecord | undefined => instances.get(id)
);

export const getPatcherInstanceParameters = (state: RootStateType): ImmuMap<ParameterRecord["id"], ParameterRecord> => state.patchers.instanceParameters;

export const getPatcherInstanceParametersSortedByInstanceIdAndIndex = createSelector(
	[
		getPatcherInstanceParameters
	],
	(parameters): Seq.Indexed<ParameterRecord> => {
		const collator = new Intl.Collator("en-US", { numeric: true });
		return parameters
			.valueSeq()
			.sort((a, b) => {
				if (a.instanceId !== b.instanceId) return collator.compare(a.instanceId, b.instanceId);
				if (a.index < b.index) return -1;
				if (a.index > b.index) return 1;
				return 0;
			});
	}
);

export const getPatcherInstanceParametersWithMIDIMapping = createSelector(
	[
		getPatcherInstanceParameters
	],
	(parameters): ImmuMap<ParameterRecord["id"], ParameterRecord> => {
		return parameters.filter(p => p.isMidiMapped);
	}
);

export const getPatcherInstancesAreWaitingForMIDIMappingBySetView = createSelector(
	[
		getPatcherInstances,
		(state: RootStateType, setView: GraphSetViewRecord): GraphSetViewRecord => setView
	],
	(instances, setView): boolean => {
		const ids = setView.instanceIds.toArray();
		if (!ids.length) return false;
		for (const instanceId of ids) {
			const instance = instances.get(instanceId);
			if (!instance || !instance.waitingForMidiMapping) return false;
		}
		return true;
	}
);

export const getPatcherInstanceParametersBySetView = createSelector(
	[
		getPatcherInstanceParameters,
		(state: RootStateType, setView: GraphSetViewRecord): GraphSetViewRecord["params"] => setView.params
	],
	(parameters, viewParamList): ImmuOrderedSet<ParameterRecord> => {
		return ImmuOrderedSet<ParameterRecord>().withMutations(list => {
			const entries = viewParamList.valueSeq().toArray();
			for (const { instanceId, paramIndex } of entries) {
				const param = parameters.find(p => p.instanceId === instanceId && p.index === paramIndex);
				if (param) list.add(param);
			}
		});
	}
);

export const getPatcherInstanceParameter = createSelector(
	[
		getPatcherInstanceParameters,
		(state: RootStateType, id: ParameterRecord["id"]): ParameterRecord["id"] => id
	],
	(parameters, id): ParameterRecord | undefined => {
		return parameters.get(id);
	}
);

export const getPatcherInstanceParameterByPath = createSelector(
	[
		getPatcherInstanceParameters,
		(state: RootStateType, path: ParameterRecord["path"]): ParameterRecord["path"] => path
	],
	(parameters, path): ParameterRecord | undefined => {
		return parameters.find(p => p.path === path);
	}
);

export const getPatcherInstanceParametersByInstanceId = createSelector(
	[
		getPatcherInstanceParameters,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"]): PatcherInstanceRecord["id"] => instanceId
	],
	(parameters, instanceId): ImmuMap<ParameterRecord["id"], ParameterRecord> => {
		return parameters.filter(p => {
			return p.instanceId === instanceId;
		});
	}
);

export const getPatcherInstancesAndParameters = createSelector(
	[
		getPatcherInstances,
		getPatcherInstanceParameters,
		(state: RootStateType, searchValue: string): string => searchValue
	],
	(instances, parameters, searchValue): ImmuMap<PatcherInstanceRecord["id"], { instance: PatcherInstanceRecord; parameters: Seq.Indexed<ParameterRecord>; }> => {
		return ImmuMap<PatcherInstanceRecord["id"], { instance: PatcherInstanceRecord; parameters: Seq.Indexed<ParameterRecord>; }>()
			.withMutations(map => {
				instances.valueSeq().forEach(instance => {
					const params = parameters.filter(p => p.instanceId === instance.id && (!searchValue.length || p.matchesQuery(searchValue))).valueSeq();
					if (!params.size) return;
					map.set(instance.id, { instance, parameters: params });
				});
			});
	}
);

export const getPatcherInstanceParametersByInstanceIdAndName = createSelector(
	[
		getPatcherInstanceParameters,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"]): PatcherInstanceRecord["id"] => instanceId,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"], name: ParameterRecord["name"]): ParameterRecord["name"] => name
	],
	(parameters, instanceId, name): ParameterRecord | undefined => {
		return parameters.find(p => p.instanceId === instanceId && p.name === name);
	}
);

export const getPatcherInstanceMessageInports = (state: RootStateType): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => state.patchers.instanceMessageInports;

export const getPatcherInstanceMessageInport = createSelector(
	[
		getPatcherInstanceMessageInports,
		(state: RootStateType, id: MessagePortRecord["id"]): MessagePortRecord["id"] => id
	],
	(ports, id): MessagePortRecord | undefined => {
		return ports.get(id);
	}
);

export const getPatcherInstanceMessageInportByPath = createSelector(
	[
		getPatcherInstanceMessageInports,
		(state: RootStateType, path: MessagePortRecord["path"]): MessagePortRecord["path"] => path
	],
	(ports, path): MessagePortRecord | undefined => {
		return ports.find(p => p.path === path);
	}
);

export const getPatcherInstanceMessageInportsByInstanceId = createSelector(
	[
		getPatcherInstanceMessageInports,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"]): PatcherInstanceRecord["id"] => instanceId
	],
	(ports, instanceId): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => {
		return ports.filter(p => {
			return p.instanceId === instanceId;
		});
	}
);

export const getPatcherInstanceMessageInportsByInstanceIdAndTag = createSelector(
	[
		getPatcherInstanceMessageInports,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"]): PatcherInstanceRecord["id"] => instanceId,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"], tag: MessagePortRecord["tag"]): MessagePortRecord["tag"] => tag
	],
	(ports, instanceId, tag): MessagePortRecord | undefined => {
		return ports.find(p => p.instanceId === instanceId && p.tag === tag);
	}
);

export const getPatcherInstanceMessageOutports = (state: RootStateType): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => state.patchers.instanceMessageOutports;

export const getPatcherInstanceMessageOutport = createSelector(
	[
		getPatcherInstanceMessageOutports,
		(state: RootStateType, id: MessagePortRecord["id"]): MessagePortRecord["id"] => id
	],
	(ports, id): MessagePortRecord | undefined => {
		return ports.get(id);
	}
);

export const getPatcherInstanceMessageOutportByPath = createSelector(
	[
		getPatcherInstanceMessageOutports,
		(state: RootStateType, path: MessagePortRecord["path"]): MessagePortRecord["path"] => path
	],
	(ports, path): MessagePortRecord | undefined => {
		return ports.find(p => p.path === path);
	}
);

export const getPatcherInstanceMesssageOutportsByInstanceId = createSelector(
	[
		getPatcherInstanceMessageOutports,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"]): PatcherInstanceRecord["id"] => instanceId
	],
	(ports, instanceId): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => {
		return ports.filter(p => {
			return p.instanceId === instanceId;
		});
	}
);

export const getPatcherInstanceMesssageOutportsByInstanceIdAndTag = createSelector(
	[
		getPatcherInstanceMessageOutports,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"]): PatcherInstanceRecord["id"] => instanceId,
		(state: RootStateType, instanceId: PatcherInstanceRecord["id"], tag: MessagePortRecord["tag"]): MessagePortRecord["tag"] => tag
	],
	(ports, instanceId, tag): MessagePortRecord | undefined => {
		return ports.find(p => p.instanceId === instanceId && p.tag === tag);
	}
);
