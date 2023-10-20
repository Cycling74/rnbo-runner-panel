import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOInstance } from "../lib/types";
import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { PresetRecord } from "../models/preset";
import { EntityType, ActiveInstanceEntity } from "../reducers/activeInstance";

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
		entity: ActiveInstanceEntity;
	};
}

export interface SetEntitiesAction extends ActionBase {
	type: EnitityActionType.SET_ENTITIES;
	payload: {
		type: EntityType;
		entities: ActiveInstanceEntity[];
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

export const setEntity = (type: EntityType, entity: ActiveInstanceEntity): EntityAction => {
	return {
		type: EnitityActionType.SET_ENTITY,
		payload: {
			type,
			entity
		}
	};
};

export const setEntities = (type: EntityType, entities: ActiveInstanceEntity[], clear: boolean = false): EntityAction => {
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


export const initializeInstance = (desc: OSCQueryRNBOInstance): AppThunk =>
	(dispatch) => {
		try {
			console.log(desc);

			const parameterDescriptions = desc.CONTENTS.params || {};


			// const patcherName: string | undefined = (desc as any).CONTENTS.name?.VALUE;

			dispatch(setEntities(
				EntityType.ParameterRecord,
				ParameterRecord.arrayFromDescription(parameterDescriptions),
				true
			));

			dispatch(setEntities(
				EntityType.InportRecord,
				Object.keys(desc.CONTENTS.messages?.CONTENTS.in || {}).map(name => new InportRecord({ name })),
				true
			));

			dispatch(setEntities(
				EntityType.PresetRecord,
				(desc.CONTENTS.presets?.CONTENTS?.entries?.VALUE || []).map(name => new PresetRecord({ name })),
				true
			));

			// dispatch(setSelectedPatcher(patcherName));
		} catch (e) {
			console.log(e);
		}
	};


