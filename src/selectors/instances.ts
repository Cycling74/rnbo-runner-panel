import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { DeviceStateRecord } from "../models/device";

export const getDevice = (state: RootStateType, id: DeviceStateRecord["id"]): DeviceStateRecord | undefined => state.instances.devices.get(id);
export const getDevices = (state: RootStateType): ImmuMap<DeviceStateRecord["id"], DeviceStateRecord> => state.instances.devices;

export const getDeviceByIndex = (state: RootStateType, index: DeviceStateRecord["index"]): DeviceStateRecord | undefined => {
	const id = state.graph.patcherNodeIdByIndex.get(index);
	return id ? state.instances.devices.get(id) : undefined;
};

export const getDevicesByIndex = (state: RootStateType): ImmuMap<DeviceStateRecord["index"], DeviceStateRecord> => {
	return ImmuMap<DeviceStateRecord["index"], DeviceStateRecord>().withMutations(map => {
		state.graph.patcherNodeIdByIndex.forEach((id, index) => {
			const node = getDevice(state, id);
			if (node) map.set(index, node);
		});
	});
};
