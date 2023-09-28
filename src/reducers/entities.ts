import { Map as ImmuMap } from "immutable";
import { ParameterRecord } from "../models/parameter";
import { InportRecord } from "../models/inport";
import { PresetRecord } from "../models/preset";
import { PatcherRecord } from "../models/patcher";
import { EntityAction, EnitityActionType } from "../actions/entities";


export enum EntityType {
	ParameterRecord = "parameter",
	InportRecord = "inport",
	PresetRecord = "preset",
	PatcherRecord = "patcher",
}

export type Entity = ParameterRecord | InportRecord | PresetRecord | PatcherRecord;
export type EntityMap<T extends Entity> = ImmuMap<string, T>;

export interface EntityState {
	[EntityType.ParameterRecord]: ImmuMap<ParameterRecord["id"], ParameterRecord>,
	[EntityType.InportRecord]: ImmuMap<InportRecord["id"], InportRecord>,
	[EntityType.PresetRecord]: ImmuMap<PresetRecord["id"], PresetRecord>;
	[EntityType.PatcherRecord]: ImmuMap<PatcherRecord["id"], PatcherRecord>;
}

export const getEntities = (state: EntityState, type: EntityType): ImmuMap<string, Entity> => {
	switch (type) {
		case EntityType.ParameterRecord:
			return state.parameter;
		case EntityType.InportRecord:
			return state.inport;
		case EntityType.PresetRecord:
			return state.preset;
		case EntityType.PatcherRecord:
		default:
			return state.patcher;
	}
};

export const entities = (state: EntityState = {

	[EntityType.ParameterRecord]: ImmuMap<ParameterRecord["id"], ParameterRecord>(),
	[EntityType.InportRecord]: ImmuMap<InportRecord["id"], InportRecord>(),
	[EntityType.PresetRecord]: ImmuMap<PresetRecord["id"], PresetRecord>(),
	[EntityType.PatcherRecord]: ImmuMap<PatcherRecord["id"], PatcherRecord>()


}, action: EntityAction) => {
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
