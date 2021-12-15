import { ActionBase } from "../lib/store";
import { EntityType, Entity } from "../reducers/entities";

export enum EnitityActionType {
	SET_ENTITY = "SET_ENTITY",
	SET_ENTITIES = "SET_ENTITIES",
	DELETE_ENTITY = "DELETE_ENTITY",
	DELETE_ENTITIES = "DELETE_ENTITIES",
	CLEAR_ENTITIES = "CLEAR_ENTITIES"
}

export interface SetEntityAction extends ActionBase {
	type: EnitityActionType.SET_ENTITY;
	payload: {
		type: EntityType;
		entity: Entity;
	};
}

export interface SetEntitiesAction extends ActionBase {
	type: EnitityActionType.SET_ENTITIES;
	payload: {
		type: EntityType;
		entities: Entity[];
		clear: boolean;
	};
}

export interface DeleteEntityAction extends ActionBase {
	type: EnitityActionType.DELETE_ENTITY;
	payload: {
		type: EntityType;
		id: string;
	};
}

export interface DeleteEntitiesAction extends ActionBase {
	type: EnitityActionType.DELETE_ENTITIES;
	payload: {
		type: EntityType;
		ids: string[];
	};
}

export interface ClearEntitiesAction extends ActionBase {
	type: EnitityActionType.CLEAR_ENTITIES;
	payload: {
		type: EntityType;
	};
}

export type EntityAction = SetEntityAction | SetEntitiesAction | DeleteEntityAction | DeleteEntitiesAction | ClearEntitiesAction;

export const deleteEntity = (type: EntityType, id: string): EntityAction => {
	return {
		type: EnitityActionType.DELETE_ENTITY,
		payload: {
			type,
			id
		}
	};
};

export const deleteEntities =  (type: EntityType, ids: string[]): EntityAction => {
	return {
		type: EnitityActionType.DELETE_ENTITIES,
		payload: {
			type,
			ids
		}
	};
};

export const setEntity = (type: EntityType, entity: Entity): EntityAction => {
	return {
		type: EnitityActionType.SET_ENTITY,
		payload: {
			type,
			entity
		}
	};
};

export const setEntities = (type: EntityType, entities: Entity[], clear: boolean = false): EntityAction => {
	return {
		type: EnitityActionType.SET_ENTITIES,
		payload: {
			type,
			entities,
			clear
		}
	};
};

export const clearEntities = (type: EntityType): EntityAction => {
	return {
		type: EnitityActionType.CLEAR_ENTITIES,
		payload: {
			type
		}
	};
};
