import { Map as ImmuMap } from "immutable";
import { InstanceStateRecord } from "../models/instance";
import { InstanceAction, InstanceActionType } from "../actions/instances";

export interface InstanceInstancesState {
	instances: ImmuMap<InstanceStateRecord["id"], InstanceStateRecord>;
}

export const instances = (state: InstanceInstancesState = {

	instances: ImmuMap<InstanceStateRecord["id"], InstanceStateRecord>()
}, action: InstanceAction): InstanceInstancesState => {

	switch(action.type) {

		case InstanceActionType.SET_INSTANCE: {
			const { instance } = action.payload;

			return {
				...state,
				instances: state.instances.set(instance.id, instance)
			};
		}

		case InstanceActionType.SET_INSTANCES: {
			const { instances } = action.payload;

			return {
				...state,
				instances: state.instances.withMutations(map => {
					for (const instance of instances) {
						map.set(instance.id, instance);
					}
				})
			};
		}

		case InstanceActionType.DELETE_INSTANCE: {
			const { instance } = action.payload;

			return {
				...state,
				instances: state.instances.delete(instance.id)
			};
		}

		case InstanceActionType.DELETE_INSTANCES: {
			const { instances } = action.payload;

			return {
				...state,
				instances: state.instances.deleteAll(instances.map(d => d.id))
			};
		}

		default:
			return state;
	}
};
