import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { InstanceStateRecord } from "../models/instance";
import { createSelector } from "reselect";
import { getPatcherIdsByIndex } from "./graph";

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
