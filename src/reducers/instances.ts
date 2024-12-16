import { Map as ImmuMap } from "immutable";
import { PatcherInstanceRecord } from "../models/instance";
import { InstanceAction, InstanceActionType } from "../actions/instances";
import { ParameterRecord } from "../models/parameter";
import { MessagePortRecord } from "../models/messageport";
import { PatcherRecord } from "../models/patcher";

export interface InstanceInstancesState {
	instances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>;
	messageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	messageOutports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>;
	patchers: ImmuMap<PatcherRecord["id"], PatcherRecord>;
}

export const instances = (state: InstanceInstancesState = {

	instances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>(),
	messageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>(),
	messageOutports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>(),
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>(),
	patchers: ImmuMap<PatcherRecord["id"], PatcherRecord>()

}, action: InstanceAction): InstanceInstancesState => {

	switch(action.type) {

		case InstanceActionType.INIT_PATCHERS: {
			const { patchers } = action.payload;

			return {
				...state,
				patchers: ImmuMap<PatcherRecord["id"], PatcherRecord>(patchers.map(p => [p.id, p]))
			};
		}

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
				parameters: state.parameters.filter(param => param.instanceIndex !== instance.index),
				messageInports: state.messageInports.filter(port => port.instanceIndex !== instance.index),
				messageOutports: state.messageOutports.filter(port => port.instanceIndex !== instance.index)
			};
		}

		case InstanceActionType.DELETE_INSTANCES: {
			const { instances } = action.payload;
			const indexSet = new Set<number>(instances.map(i => i.index));

			return {
				...state,
				instances: state.instances.deleteAll(instances.map(d => d.id)),
				parameters: state.parameters.filter(param => !indexSet.has(param.instanceIndex)),
				messageInports: state.messageInports.filter(port => !indexSet.has(port.instanceIndex)),
				messageOutports: state.messageOutports.filter(port => !indexSet.has(port.instanceIndex))
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

		case InstanceActionType.SET_MESSAGE_INPORT: {
			const { port } = action.payload;

			return {
				...state,
				messageInports: state.messageInports.set(port.id, port)
			};
		}

		case InstanceActionType.SET_MESSAGE_INPORTS: {
			const { ports } = action.payload;

			return {
				...state,
				messageInports: state.messageInports.withMutations(map => {
					for (const port of ports) {
						map.set(port.id, port);
					}
				})
			};
		}

		case InstanceActionType.DELETE_MESSAGE_INPORT: {
			const { port } = action.payload;

			return {
				...state,
				messageInports: state.messageInports.delete(port.id)
			};
		}

		case InstanceActionType.DELETE_MESSAGE_INPORTS: {
			const { ports } = action.payload;

			return {
				...state,
				messageInports: state.messageInports.deleteAll(ports.map(d => d.id))
			};
		}

		case InstanceActionType.SET_MESSAGE_OUTPORT: {
			const { port } = action.payload;

			return {
				...state,
				messageOutports: state.messageOutports.set(port.id, port)
			};
		}

		case InstanceActionType.SET_MESSAGE_OUTPORTS: {
			const { ports } = action.payload;

			return {
				...state,
				messageOutports: state.messageOutports.withMutations(map => {
					for (const port of ports) {
						map.set(port.id, port);
					}
				})
			};
		}

		case InstanceActionType.DELETE_MESSAGE_OUTPORT: {
			const { port } = action.payload;

			return {
				...state,
				messageOutports: state.messageOutports.delete(port.id)
			};
		}

		case InstanceActionType.DELETE_MESSAGE_OUTPORTS: {
			const { ports } = action.payload;

			return {
				...state,
				messageOutports: state.messageOutports.deleteAll(ports.map(d => d.id))
			};
		}

		default:
			return state;
	}
};
