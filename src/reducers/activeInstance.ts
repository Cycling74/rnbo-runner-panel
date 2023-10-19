import { Map as ImmuMap } from "immutable";
import { ParameterRecord } from "../models/parameter";
import { InportRecord } from "../models/inport";
import { PresetRecord } from "../models/preset";
import { PatcherRecord } from "../models/patcher";
import { EntityAction, EnitityActionType } from "../actions/activeInstance";

export enum EntityType {
	ParameterRecord = "parameter",
	InportRecord = "inport",
	// OutportRecord = "outport",
	PresetRecord = "preset"
}

export type ActiveInstanceEntity = ParameterRecord | InportRecord | PresetRecord | PatcherRecord;
export type ActiveInstanceEntityMap<T extends ActiveInstanceEntity> = ImmuMap<string, T>;

export interface ActiveInstanceState {
	index: number;
	[EntityType.ParameterRecord]: ImmuMap<ParameterRecord["id"], ParameterRecord>,
	[EntityType.InportRecord]: ImmuMap<InportRecord["id"], InportRecord>,
	// [EntityType.OutportRecord]: ImmuMap<OutportRecord["id"], OutportRecord>,
	[EntityType.PresetRecord]: ImmuMap<PresetRecord["id"], PresetRecord>;
}

export const getEntities = (state: ActiveInstanceState, type: EntityType): ImmuMap<string, ActiveInstanceEntity> => {
	switch (type) {
		case EntityType.ParameterRecord:
			return state.parameter;
		case EntityType.InportRecord:
			return state.inport;
		case EntityType.PresetRecord:
		default:
			return state.preset;
	}
};

export const activeInstance = (state: ActiveInstanceState = {

	index: 0,
	[EntityType.ParameterRecord]: ImmuMap<ParameterRecord["id"], ParameterRecord>(),
	[EntityType.InportRecord]: ImmuMap<InportRecord["id"], InportRecord>(),
	[EntityType.PresetRecord]: ImmuMap<PresetRecord["id"], PresetRecord>()


}, action: EntityAction): ActiveInstanceState => {
	switch (action.type) {
		case EnitityActionType.SET_ENTITY: {
			const { entity, type } = action.payload;
			return {
				...state,
				[type]: getEntities(state, type).set(entity.id, entity)
			};
		}

		case EnitityActionType.SET_ENTITIES: {
			const { entities: setEntities, type, clear } = action.payload;
			const newEnts = setEntities.reduce((map, entity) => {
				return map.set(entity.id, entity);
			}, clear ? ImmuMap() : getEntities(state, type));

			return {
				...state,
				[type]: newEnts
			};
		}

		case EnitityActionType.DELETE_ENTITY: {
			const { id, type } = action.payload;
			return {
				...state,
				[type]: getEntities(state, type).delete(id)
			};
		}

		case EnitityActionType.DELETE_ENTITIES: {
			const { ids, type } = action.payload;
			return {
				...state,
				[type]: getEntities(state, type).filter(entity => !ids.includes(entity.id))
			};
		}

		case EnitityActionType.CLEAR_ENTITIES: {
			const { type } = action.payload;

			return {
				...state,
				[type]: ImmuMap()
			};
		}

		default:
			return state;
	}
};
