import { Map as ImmuMap } from "immutable";
import { DeviceStateRecord } from "../models/device";
import { InstanceAction, InstanceActionType } from "../actions/instances";

export interface DeviceInstancesState {
	devices: ImmuMap<DeviceStateRecord["id"], DeviceStateRecord>;
}

export const instances = (state: DeviceInstancesState = {

	devices: ImmuMap<DeviceStateRecord["id"], DeviceStateRecord>()
}, action: InstanceAction): DeviceInstancesState => {

	switch(action.type) {

		case InstanceActionType.SET_DEVICE: {
			const { device } = action.payload;

			return {
				...state,
				devices: state.devices.set(device.id, device)
			};
		}

		case InstanceActionType.SET_DEVICES: {
			const { devices } = action.payload;

			return {
				...state,
				devices: state.devices.withMutations(map => {
					for (const device of devices) {
						map.set(device.id, device);
					}
				})
			};
		}

		case InstanceActionType.DELETE_DEVICE: {
			const { device } = action.payload;

			return {
				...state,
				devices: state.devices.delete(device.id)
			};
		}

		case InstanceActionType.DELETE_DEVICES: {
			const { devices } = action.payload;

			return {
				...state,
				devices: state.devices.deleteAll(devices.map(d => d.id))
			};
		}

		default:
			return state;
	}
};
