import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { PatcherInstanceRecord } from "../models/instance";
import { createSelector } from "reselect";
import { getPatcherIdsByIndex } from "./graph";
import { ParameterRecord } from "../models/parameter";
import { MessagePortRecord } from "../models/messageport";

export const getInstances = (state: RootStateType): ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord> => state.instances.instances;

export const getInstance = createSelector(
	[
		getInstances,
		(state: RootStateType, id: PatcherInstanceRecord["id"]): PatcherInstanceRecord["id"] => id
	],
	(instances, id): PatcherInstanceRecord | undefined => instances.get(id)
);

export const getInstanceByIndex = createSelector(
	[
		getInstances,
		(state: RootStateType, index: PatcherInstanceRecord["index"]): PatcherInstanceRecord["id"] | undefined => state.graph.patcherNodeIdByIndex.get(index)
	],
	(instances, id): PatcherInstanceRecord | undefined => id ? instances.get(id) : undefined
);

export const getInstancesByIndex = createSelector(
	[
		getInstances,
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
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex
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
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"], name: ParameterRecord["name"]): ParameterRecord["name"] => name
	],
	(parameters, instanceIndex, name): ParameterRecord | undefined => {
		return parameters.find(p => p.instanceIndex === instanceIndex && p.name === name);
	}
);

export const getMessageInports = (state: RootStateType): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => state.instances.messageInports;

export const getMessageInport = createSelector(
	[
		getMessageInports,
		(state: RootStateType, id: MessagePortRecord["id"]): MessagePortRecord["id"] => id
	],
	(ports, id): MessagePortRecord | undefined => {
		return ports.get(id);
	}
);

export const getMessageInportByPath = createSelector(
	[
		getMessageInports,
		(state: RootStateType, path: MessagePortRecord["path"]): MessagePortRecord["path"] => path
	],
	(ports, path): MessagePortRecord | undefined => {
		return ports.find(p => p.path === path);
	}
);

export const getInstanceMessageInports = createSelector(
	[
		getMessageInports,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex
	],
	(ports, instanceIndex): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => {
		return ports.filter(p => {
			return p.instanceIndex === instanceIndex;
		});
	}
);

export const getInstanceMessageInportByTag = createSelector(
	[
		getMessageInports,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"], tag: MessagePortRecord["tag"]): MessagePortRecord["tag"] => tag
	],
	(ports, instanceIndex, tag): MessagePortRecord | undefined => {
		return ports.find(p => p.instanceIndex === instanceIndex && p.tag === tag);
	}
);

export const getMessageOutports = (state: RootStateType): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => state.instances.messageOutports;

export const getMessageOutport = createSelector(
	[
		getMessageOutports,
		(state: RootStateType, id: MessagePortRecord["id"]): MessagePortRecord["id"] => id
	],
	(ports, id): MessagePortRecord | undefined => {
		return ports.get(id);
	}
);

export const getMessageOutportByPath = createSelector(
	[
		getMessageOutports,
		(state: RootStateType, path: MessagePortRecord["path"]): MessagePortRecord["path"] => path
	],
	(ports, path): MessagePortRecord | undefined => {
		return ports.find(p => p.path === path);
	}
);

export const getInstanceMessageOutports = createSelector(
	[
		getMessageOutports,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex
	],
	(ports, instanceIndex): ImmuMap<MessagePortRecord["id"], MessagePortRecord> => {
		return ports.filter(p => {
			return p.instanceIndex === instanceIndex;
		});
	}
);

export const getInstanceMessageOutportByTag = createSelector(
	[
		getMessageOutports,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"]): PatcherInstanceRecord["index"] => instanceIndex,
		(state: RootStateType, instanceIndex: PatcherInstanceRecord["index"], tag: MessagePortRecord["tag"]): MessagePortRecord["tag"] => tag
	],
	(ports, instanceIndex, tag): MessagePortRecord | undefined => {
		return ports.find(p => p.instanceIndex === instanceIndex && p.tag === tag);
	}
);
