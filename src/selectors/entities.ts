import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { PresetRecord } from "../models/preset";
import { PatcherRecord } from "../models/patcher";
import { RootStateType } from "../lib/store";
import { Entity, EntityMap, EntityType } from "../reducers/entities";


function getEntity(state: RootStateType, type: EntityType.InportRecord, id: string): InportRecord | undefined;
function getEntity(state: RootStateType, type: EntityType.ParameterRecord, id: string): ParameterRecord | undefined;
function getEntity(state: RootStateType, type: EntityType.PresetRecord, id: string): PresetRecord | undefined;
function getEntity(state: RootStateType, type: EntityType.PatcherRecord, id: string): PatcherRecord | undefined;
function getEntity(state: RootStateType, type: EntityType, id: string): Entity | undefined {
	return state.entities[type].get(id);
}

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

export const getPreset = (state: RootStateType, id: string): PresetRecord | undefined => {
	return getEntity(state, EntityType.PresetRecord, id);
};

export const getPresets = (state: RootStateType): EntityMap<PresetRecord> => {
	return state.entities[EntityType.PresetRecord];
};

export const getPatchers = (state: RootStateType): EntityMap<PatcherRecord> => {
	return state.entities[EntityType.PatcherRecord];
};

export const getPatcher = (state: RootStateType, name: string): PatcherRecord | undefined => {
	return getEntity(state, EntityType.PatcherRecord, name);
};

export const getLoadedPatcher = (state: RootStateType): PatcherRecord | undefined => {
	return getPatchers(state).reduce((c, p) => {
		return p.loaded ? p : c;
	}, undefined);
};
