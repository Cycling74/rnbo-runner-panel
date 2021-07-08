import { ActionBase } from "../lib/store";
import { EntityType, Entity } from "../reducers/entities";

export enum EnitityActionType {
	SET_ENTITY = "SET_ENTITY",
	SET_ENTITIES = "SET_ENTITIES",
	DELETE_ENTITY = "DELETE_ENTITY",
	DELETE_ENTITIES = "DELETE_ENTITIES",
	CLEAR_ENTITIES = "CLEAR_ENTITIES"
};

export interface ISetEntityAction extends ActionBase {
	type: EnitityActionType.SET_ENTITY;
	payload: {
		type: EntityType;
		entity: Entity;
	};
};

export interface ISetEntitiesAction extends ActionBase {
	type: EnitityActionType.SET_ENTITIES;
	payload: {
		type: EntityType;
		entities: Entity[];
	};
};

export interface IDeleteEntityAction extends ActionBase {
	type: EnitityActionType.DELETE_ENTITY;
	payload: {
		type: EntityType;
		id: string;
	};
};

export interface IDeleteEntitiesAction extends ActionBase {
	type: EnitityActionType.DELETE_ENTITIES;
	payload: {
		type: EntityType;
		ids: string[];
	};
};

export interface IClearEntitiesAction extends ActionBase {
	type: EnitityActionType.CLEAR_ENTITIES;
	payload: {
		type: EntityType;
	};
};

export type EntityAction = ISetEntityAction | ISetEntitiesAction | IDeleteEntityAction | IDeleteEntitiesAction | IClearEntitiesAction;

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

export const setEntities = (type: EntityType, entities: Entity[]): EntityAction => {
	return {
		type: EnitityActionType.SET_ENTITIES,
		payload: {
			type,
			entities
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
