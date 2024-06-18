import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { InstanceStateRecord } from "../models/instance";
import { getAppSetting } from "./settings";
import { AppSetting, AppSettingRecord } from "../models/settings";

export const getInstance = (state: RootStateType, id: InstanceStateRecord["id"]): InstanceStateRecord | undefined => state.instances.instances.get(id);
export const getInstances = (state: RootStateType): ImmuMap<InstanceStateRecord["id"], InstanceStateRecord> => state.instances.instances;

export const getInstanceByIndex = (state: RootStateType, index: InstanceStateRecord["index"]): InstanceStateRecord | undefined => {
	const id = state.graph.patcherNodeIdByIndex.get(index);
	return id ? state.instances.instances.get(id) : undefined;
};

export const getInstancesByIndex = (state: RootStateType): ImmuMap<InstanceStateRecord["index"], InstanceStateRecord> => {
	return ImmuMap<InstanceStateRecord["index"], InstanceStateRecord>().withMutations(map => {
		state.graph.patcherNodeIdByIndex.forEach((id, index) => {
			const node = getInstance(state, id);
			if (node) map.set(index, node);
		});
	});
};

export const getParameterSortAttribute = (state: RootStateType): AppSettingRecord => getAppSetting(state, AppSetting.paramSortAttribute);
export const getParameterSortOrder = (state: RootStateType): AppSettingRecord => getAppSetting(state, AppSetting.paramSortOrder);
