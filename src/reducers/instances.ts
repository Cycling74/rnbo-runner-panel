import { Map as ImmuMap } from "immutable";
import { InstanceStateRecord } from "../models/instance";
import { InstanceAction, InstanceActionType } from "../actions/instances";
import { ParameterSortAttr, SortOrder } from "../lib/constants";

export interface InstanceInstancesState {
	instances: ImmuMap<InstanceStateRecord["id"], InstanceStateRecord>;
	parameterSortAttribute: ParameterSortAttr;
	parameterSortOrder: SortOrder;
}

export const instances = (state: InstanceInstancesState = {

	instances: ImmuMap<InstanceStateRecord["id"], InstanceStateRecord>(),
	parameterSortAttribute: ParameterSortAttr.Name,
	parameterSortOrder: SortOrder.Asc

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

		case InstanceActionType.SET_INSTANCE_PARAMTER_SORT_ATTR: {
			const { attr } = action.payload;
			return {
				...state,
				parameterSortAttribute: attr
			};
		}

		case InstanceActionType.SET_INSTANCE_PARAMTER_SORT_ORDER: {
			const { order } = action.payload;
			return {
				...state,
				parameterSortOrder: order
			};
		}

		default:
			return state;
	}
};
