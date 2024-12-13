import { Map as ImmuMap } from "immutable";
import { InstanceStateRecord } from "../models/instance";
import { InstanceAction, InstanceActionType } from "../actions/instances";
import { ParameterRecord } from "../models/parameter";

export interface InstanceInstancesState {
	instances: ImmuMap<InstanceStateRecord["id"], InstanceStateRecord>;
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>;
}

export const instances = (state: InstanceInstancesState = {

	instances: ImmuMap<InstanceStateRecord["id"], InstanceStateRecord>(),
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>()

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
				instances: state.instances.delete(instance.id),
				parameters: state.parameters.filter(param => param.instanceIndex !== instance.index)
			};
		}

		case InstanceActionType.DELETE_INSTANCES: {
			const { instances } = action.payload;
			const indexSet = new Set<number>(instances.map(i => i.index));

			return {
				...state,
				instances: state.instances.deleteAll(instances.map(d => d.id)),
				parameters: state.parameters.filter(param => !indexSet.has(param.instanceIndex))
			};
		}

		case InstanceActionType.SET_PARAMETER: {
			const { parameter } = action.payload;

			return {
				...state,
				parameters: state.parameters.set(parameter.id, parameter)
			};
		}

		case InstanceActionType.SET_PARAMETERS: {
			const { parameters } = action.payload;

			return {
				...state,
				parameters: state.parameters.withMutations(map => {
					for (const param of parameters) {
						map.set(param.id, param);
					}
				})
			};
		}

		case InstanceActionType.DELETE_PARAMETER: {
			const { parameter } = action.payload;

			return {
				...state,
				parameters: state.parameters.delete(parameter.id)
			};
		}

		case InstanceActionType.DELETE_PARAMETERS: {
			const { parameters } = action.payload;

			return {
				...state,
				parameters: state.parameters.deleteAll(parameters.map(d => d.id))
			};
		}

		default:
			return state;
	}
};
