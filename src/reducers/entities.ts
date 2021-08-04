import { Map } from "immutable";
import { ParameterRecord } from "../models/parameter";
import { InportRecord } from "../models/inport";
import { EntityAction, EnitityActionType } from "../actions/entities";


export enum EntityType {
	ParameterRecord = "parameter",
	InportRecord = "inport"
}

export type Entity = ParameterRecord | InportRecord;
export type EntityMap<T extends Entity> = Map<string, T>;

export interface EntityState {
	[EntityType.ParameterRecord]: Map<ParameterRecord["id"], ParameterRecord>,
	[EntityType.InportRecord]: Map<InportRecord["id"], InportRecord>;
}

export const getEntities = (state: EntityState, type: EntityType): Map<string, Entity> => {
	switch (type) {
		case EntityType.ParameterRecord:
			return state.parameter;
		case EntityType.InportRecord:
			return state.inport;
	}
};

export const entities = (state: EntityState = {

	[EntityType.ParameterRecord]: Map<ParameterRecord["id"], ParameterRecord>(),
	[EntityType.InportRecord]: Map<InportRecord["id"], InportRecord>()

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
			const { entities, type } = action.payload;

			const newEnts = entities.reduce((map, entity) => {
				return map.set(entity.id, entity);
			}, getEntities(state, type));

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
			const { ids, type } = action.payload;
			return {
				...state,
				[type]: getEntities(state, type).filter(entity => !ids.includes(entity.id))
			}
		}

		case EnitityActionType.CLEAR_ENTITIES: {
			const { type } = action.payload;

			return {
				...state,
				[type]: Map()
			};
		}

		default:
			return state;
	}
};