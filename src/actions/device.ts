import { Dispatch } from "react";
import { AnyJson } from "../lib/types";
import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { RootStateType } from "../reducers";
import { EntityType } from "../reducers/entities";
import { setEntities, setEntity } from "./entities";
import { AppThunkResult } from "./types";

export const setParameterValue = (name: ParameterRecord["name"], value: number, normalized: boolean):
	AppThunkResult => (dispatch, getState) =>
{
	let parameter = getState().entities.parameter.get(name);
	if (parameter) {
		parameter = normalized ? parameter.set("normalizedValue", value) : parameter.set("value", value);
		dispatch(setEntity(EntityType.ParameterRecord, parameter));
	}
};

export const initializeDevice = (desc: AnyJson):
	AppThunkResult => (dispatch) =>
{
	let parameterDescriptions = {};
	let inportDescriptions = {};
	try {
		parameterDescriptions = (desc as any).CONTENTS.params;
		inportDescriptions = (desc as any).CONTENTS.messages.CONTENTS.in;
	} catch (e) {}
	dispatch(setEntities(
		EntityType.ParameterRecord,
		ParameterRecord.arrayFromDescription(parameterDescriptions)
	));
	dispatch(setEntities(
		EntityType.InportRecord,
		InportRecord.arrayFromDescription(inportDescriptions)
	));
}
