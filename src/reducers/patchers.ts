import { Map as ImmuMap } from "immutable";
import { PatcherInstanceRecord } from "../models/instance";
import { InstanceAction, PatcherActionType } from "../actions/patchers";
import { ParameterRecord } from "../models/parameter";
import { MessagePortRecord } from "../models/messageport";
import { PatcherExportRecord } from "../models/patcher";

export interface PatcherState {
	exports: ImmuMap<PatcherExportRecord["id"], PatcherExportRecord>;
	instances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>;
	instanceMessageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	instanceMessageOutports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>;
	instanceParameters: ImmuMap<ParameterRecord["id"], ParameterRecord>;
}

export const patchers = (state: PatcherState = {

	exports: ImmuMap<PatcherExportRecord["id"], PatcherExportRecord>(),
	instances: ImmuMap<PatcherInstanceRecord["id"], PatcherInstanceRecord>(),
	instanceMessageInports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>(),
	instanceMessageOutports: ImmuMap<MessagePortRecord["id"], MessagePortRecord>(),
	instanceParameters: ImmuMap<ParameterRecord["id"], ParameterRecord>()

}, action: InstanceAction): PatcherState => {

	switch(action.type) {

		case PatcherActionType.INIT_PATCHERS: {
			const { patchers } = action.payload;

			return {
				...state,
				exports: ImmuMap<PatcherExportRecord["id"], PatcherExportRecord>(patchers.map(p => [p.id, p]))
			};
		}

		case PatcherActionType.SET_INSTANCE: {
			const { instance } = action.payload;

			return {
				...state,
				instances: state.instances.set(instance.id, instance)
			};
		}

		case PatcherActionType.SET_INSTANCES: {
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

		case PatcherActionType.DELETE_INSTANCE: {
			const { instance } = action.payload;

			return {
				...state,
				instances: state.instances.delete(instance.id),
				instanceParameters: state.instanceParameters.filter(param => param.instanceIndex !== instance.index),
				instanceMessageInports: state.instanceMessageInports.filter(port => port.instanceIndex !== instance.index),
				instanceMessageOutports: state.instanceMessageOutports.filter(port => port.instanceIndex !== instance.index)
			};
		}

		case PatcherActionType.DELETE_INSTANCES: {
			const { instances } = action.payload;
			const indexSet = new Set<number>(instances.map(i => i.index));

			return {
				...state,
				instances: state.instances.deleteAll(instances.map(d => d.id)),
				instanceParameters: state.instanceParameters.filter(param => !indexSet.has(param.instanceIndex)),
				instanceMessageInports: state.instanceMessageInports.filter(port => !indexSet.has(port.instanceIndex)),
				instanceMessageOutports: state.instanceMessageOutports.filter(port => !indexSet.has(port.instanceIndex))
			};
		}

		case PatcherActionType.SET_PARAMETER: {
			const { parameter } = action.payload;

			return {
				...state,
				instanceParameters: state.instanceParameters.set(parameter.id, parameter)
			};
		}

		case PatcherActionType.SET_PARAMETERS: {
			const { parameters } = action.payload;

			return {
				...state,
				instanceParameters: state.instanceParameters.withMutations(map => {
					for (const param of parameters) {
						map.set(param.id, param);
					}
				})
			};
		}

		case PatcherActionType.DELETE_PARAMETER: {
			const { parameter } = action.payload;

			return {
				...state,
				instanceParameters: state.instanceParameters.delete(parameter.id)
			};
		}

		case PatcherActionType.DELETE_PARAMETERS: {
			const { parameters } = action.payload;

			return {
				...state,
				instanceParameters: state.instanceParameters.deleteAll(parameters.map(d => d.id))
			};
		}

		case PatcherActionType.SET_MESSAGE_INPORT: {
			const { port } = action.payload;

			return {
				...state,
				instanceMessageInports: state.instanceMessageInports.set(port.id, port)
			};
		}

		case PatcherActionType.SET_MESSAGE_INPORTS: {
			const { ports } = action.payload;

			return {
				...state,
				instanceMessageInports: state.instanceMessageInports.withMutations(map => {
					for (const port of ports) {
						map.set(port.id, port);
					}
				})
			};
		}

		case PatcherActionType.DELETE_MESSAGE_INPORT: {
			const { port } = action.payload;

			return {
				...state,
				instanceMessageInports: state.instanceMessageInports.delete(port.id)
			};
		}

		case PatcherActionType.DELETE_MESSAGE_INPORTS: {
			const { ports } = action.payload;

			return {
				...state,
				instanceMessageInports: state.instanceMessageInports.deleteAll(ports.map(d => d.id))
			};
		}

		case PatcherActionType.SET_MESSAGE_OUTPORT: {
			const { port } = action.payload;

			return {
				...state,
				instanceMessageOutports: state.instanceMessageOutports.set(port.id, port)
			};
		}

		case PatcherActionType.SET_MESSAGE_OUTPORTS: {
			const { ports } = action.payload;

			return {
				...state,
				instanceMessageOutports: state.instanceMessageOutports.withMutations(map => {
					for (const port of ports) {
						map.set(port.id, port);
					}
				})
			};
		}

		case PatcherActionType.DELETE_MESSAGE_OUTPORT: {
			const { port } = action.payload;

			return {
				...state,
				instanceMessageOutports: state.instanceMessageOutports.delete(port.id)
			};
		}

		case PatcherActionType.DELETE_MESSAGE_OUTPORTS: {
			const { ports } = action.payload;

			return {
				...state,
				instanceMessageOutports: state.instanceMessageOutports.deleteAll(ports.map(d => d.id))
			};
		}

		default:
			return state;
	}
};
