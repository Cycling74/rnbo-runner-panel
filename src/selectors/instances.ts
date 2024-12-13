import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { InstanceStateRecord } from "../models/instance";
import { createSelector } from "reselect";
import { getPatcherIdsByIndex } from "./graph";
import { ParameterRecord } from "../models/parameter";

export const getInstances = (state: RootStateType): ImmuMap<InstanceStateRecord["id"], InstanceStateRecord> => state.instances.instances;

export const getInstance = createSelector(
	[
		getInstances,
		(state: RootStateType, id: InstanceStateRecord["id"]): InstanceStateRecord["id"] => id
	],
	(instances, id): InstanceStateRecord | undefined => instances.get(id)
);

export const getInstanceByIndex = createSelector(
	[
		getInstances,
		(state: RootStateType, index: InstanceStateRecord["index"]): InstanceStateRecord["id"] | undefined => state.graph.patcherNodeIdByIndex.get(index)
	],
	(instances, id): InstanceStateRecord | undefined => id ? instances.get(id) : undefined
);

export const getInstancesByIndex = createSelector(
	[
		getInstances,
		getPatcherIdsByIndex
	],
	(instances, idsByIndex): ImmuMap<InstanceStateRecord["index"], InstanceStateRecord> => {
		return ImmuMap<InstanceStateRecord["index"], InstanceStateRecord>().withMutations(map => {
			idsByIndex.forEach((id, index) => {
				const node = instances.get(id);
				if (node) map.set(index, node);
			});
		});
	}
);

export const getParameters = (state: RootStateType): ImmuMap<ParameterRecord["id"], ParameterRecord> => state.instances.parameters;

export const getParameter = createSelector(
	[
		getParameters,
		(state: RootStateType, id: ParameterRecord["id"]): ParameterRecord["id"] => id
	],
	(parameters, id): ParameterRecord | undefined => {
		return parameters.get(id);
	}
);

export const getParameterByPath = createSelector(
	[
		getParameters,
		(state: RootStateType, path: ParameterRecord["path"]): ParameterRecord["path"] => path
	],
	(parameters, path): ParameterRecord | undefined => {
		return parameters.find(p => p.path === path);
	}
);

export const getInstanceParameters = createSelector(
	[
		getParameters,
		(state: RootStateType, instanceIndex: InstanceStateRecord["index"]): InstanceStateRecord["index"] => instanceIndex
	],
	(parameters, instanceIndex): ImmuMap<ParameterRecord["id"], ParameterRecord> => {
		return parameters.filter(p => {
			return p.instanceIndex === instanceIndex;
		});
	}
);


export const getInstanceParameterByName = createSelector(
	[
		getParameters,
		(state: RootStateType, instanceIndex: InstanceStateRecord["index"]): InstanceStateRecord["index"] => instanceIndex,
		(state: RootStateType, instanceIndex: InstanceStateRecord["index"], name: ParameterRecord["name"]): ParameterRecord["name"] => name
	],
	(parameters, instanceIndex, name): ParameterRecord | undefined => {
		return parameters.find(p => p.instanceIndex === instanceIndex && p.name === name);
	}
);
