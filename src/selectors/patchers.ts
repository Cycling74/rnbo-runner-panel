import { Map as ImmuMap, Seq, OrderedSet as ImmuOrderedSet } from "immutable";
import { RootStateType } from "../lib/store";
import { PatcherInstanceRecord } from "../models/instance";
import { createSelector } from "reselect";
import { getPatcherIdsByIndex } from "./graph";
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

const collator = new Intl.Collator("en-US");
export const getPatchersSortedByName = createSelector(
	[
		getPatcherExports,
		(state: RootStateType, order: SortOrder): SortOrder => order
	],
	(patchers, order): Seq.Indexed<PatcherExportRecord> => {
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

export const getPatcherInstanceByIndex = createSelector(
	[
		getPatcherInstances,
		(state: RootStateType, index: PatcherInstanceRecord["index"]): PatcherInstanceRecord["id"] | undefined => state.graph.patcherNodeIdByIndex.get(index)
	],
	(instances, id): PatcherInstanceRecord | undefined => id ? instances.get(id) : undefined
);

export const getPatcherInstancesByIndex = createSelector(
	[
		getPatcherInstances,
		getPatcherIdsByIndex
	],
	(instances, idsByIndex): ImmuMap<PatcherInstanceRecord["index"], PatcherInstanceRecord> => {
		return ImmuMap<PatcherInstanceRecord["index"], PatcherInstanceRecord>().withMutations(map => {
			idsByIndex.forEach((id, index) => {
				const node = instances.get(id);
				if (node) map.set(index, node);
			});
		});
	}
);

export const getPatcherInstanceParameters = (state: RootStateType): ImmuMap<ParameterRecord["id"], ParameterRecord> => state.patchers.instanceParameters;

export const getPatcherInstanceParamtersSortedByIndex = createSelector(
	[
		getPatcherInstanceParameters
	],
	(parameters): Seq.Indexed<ParameterRecord> => {
		return parameters
			.valueSeq()
			.sort((a, b) => {
				if (a.instanceIndex < b.instanceIndex) return -1;
				if (a.instanceIndex > b.instanceIndex) return 1;
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

export const getPatcherInstanceParametersBySetView = createSelector(
	[
		getPatcherInstanceParameters,
		(state: RootStateType, setView: GraphSetViewRecord): GraphSetViewRecord["params"] => setView.params
	],
	(parameters, viewParamList): ImmuOrderedSet<ParameterRecord> => {
		return ImmuOrderedSet<ParameterRecord>().withMutations(list => {
			const entries = viewParamList.valueSeq().toArray();
			for (const { instanceIndex, paramIndex } of entries) {
				const param = parameters.find(p => p.instanceIndex === instanceIndex && p.index === paramIndex);
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

export const getPatcherInstanceParametersByInstanceIndex = createSelector(
	[
		getPatcherInstanceParameters,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex
	],
	(parameters, instanceIndex): ImmuMap<ParameterRecord["id"], ParameterRecord> => {
		return parameters.filter(p => {
			return p.instanceIndex === instanceIndex;
		});
	}
);

export const getPatcherInstancesAndParameters = createSelector(
	[
		getPatcherInstances,
		getPatcherInstanceParameters
	],
	(instances, parameters): ImmuMap<PatcherInstanceRecord["id"], { instance: PatcherInstanceRecord; parameters: Seq.Indexed<ParameterRecord>; }> => {
		return ImmuMap<PatcherInstanceRecord["id"], { instance: PatcherInstanceRecord; parameters: Seq.Indexed<ParameterRecord>; }>()
			.withMutations(map => {
				instances.valueSeq().forEach(instance => {
					map.set(instance.id, {
						instance,
						parameters: parameters.filter(p => p.instanceIndex === instance.index).valueSeq()
					});
				});
			});
	}
);

export const getPatcherInstanceParametersByInstanceIndexAndName = createSelector(
	[
		getPatcherInstanceParameters,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"], name: ParameterRecord["name"]): ParameterRecord["name"] => name
	],
	(parameters, instanceIndex, name): ParameterRecord | undefined => {
		return parameters.find(p => p.instanceIndex === instanceIndex && p.name === name);
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

export const getPatcherInstanceMessageInportsByInstanceIndex = createSelector(
	[
		getPatcherInstanceMessageInports,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex
	],
	(ports, instanceIndex): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => {
		return ports.filter(p => {
			return p.instanceIndex === instanceIndex;
		});
	}
);

export const getPatcherInstanceMessageInportsByInstanceIndexAndTag = createSelector(
	[
		getPatcherInstanceMessageInports,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"], tag: MessagePortRecord["tag"]): MessagePortRecord["tag"] => tag
	],
	(ports, instanceIndex, tag): MessagePortRecord | undefined => {
		return ports.find(p => p.instanceIndex === instanceIndex && p.tag === tag);
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

export const getPatcherInstanceMesssageOutportsByInstanceIndex = createSelector(
	[
		getPatcherInstanceMessageOutports,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex
	],
	(ports, instanceIndex): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => {
		return ports.filter(p => {
			return p.instanceIndex === instanceIndex;
		});
	}
);

export const getPatcherInstanceMesssageOutportsByInstanceIndexAndTag = createSelector(
	[
		getPatcherInstanceMessageOutports,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"], tag: MessagePortRecord["tag"]): MessagePortRecord["tag"] => tag
	],
	(ports, instanceIndex, tag): MessagePortRecord | undefined => {
		return ports.find(p => p.instanceIndex === instanceIndex && p.tag === tag);
	}
);
