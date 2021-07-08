import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { RootStateType } from "../lib/store";
import { Entity, EntityMap, EntityType } from "../reducers/entities";


function getEntity (state: RootStateType, type: EntityType.InportRecord, id: string): InportRecord | undefined;
function getEntity (state: RootStateType, type: EntityType.ParameterRecord, id: string): ParameterRecord | undefined;
function getEntity (state: RootStateType, type: EntityType, id: string): Entity | undefined {
	return state.entities[type].get(id);
};

export const getParameter = (state: RootStateType, id: string): ParameterRecord | undefined => {
	return getEntity(state, EntityType.ParameterRecord, id);
};

export const getParameters = (state: RootStateType): EntityMap<ParameterRecord> => {
	return state.entities[EntityType.ParameterRecord];
};

export const getInport = (state: RootStateType, id: string): InportRecord | undefined => {
	return getEntity(state, EntityType.InportRecord, id);
};

export const getInports = (state: RootStateType): EntityMap<InportRecord> => {
	return state.entities[EntityType.InportRecord];
};
