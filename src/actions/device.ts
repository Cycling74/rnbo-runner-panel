import { writePacket } from "osc";
import { AnyJson } from "../lib/types";
import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { PresetRecord } from "../models/preset";
import { EntityType } from "../reducers/entities";
import { setEntities, setEntity } from "./entities";
import { AppThunk } from "../lib/store";
import throttle from "lodash.throttle";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";

export const setParameterValue = (name: ParameterRecord["name"], value: number, normalized: boolean): AppThunk =>
(dispatch, getState) => {
	let parameter = getState().entities.parameter.get(name);
	if (parameter) {
		parameter = normalized ? parameter.set("normalizedValue", value) : parameter.set("value", value);
		dispatch(setEntity(EntityType.ParameterRecord, parameter));
	}
};

export const setRemoteParameterValueNormalized = throttle((name: string, value: number): AppThunk =>
() => {
	const message = {
		address: `/rnbo/inst/0/params/${name}/normalized`,
		args: [
			{ type: "f", value }
		]
	};
	oscQueryBridge.sendPacket(writePacket(message));
}, 100);

export const triggerRemoteMidiNoteEvent = (pitch: number, isNoteOn: boolean): AppThunk =>
() => {

	const midiChannel = 0;
	const routeByte = (isNoteOn ? 144 : 128) + midiChannel;
	const velocityByte = (isNoteOn ? 100 : 0);

	const message = {
		address: `/rnbo/inst/0/midi/in`,
		args: [ routeByte, pitch, velocityByte ].map(byte => ({ type: "i", value: byte }))
	};

	oscQueryBridge.sendPacket(writePacket(message));
};

export const sendListToRemoteInport = (name: string, values: number[]): AppThunk =>
() => {
	const message = {
		address: `/rnbo/inst/0/messages/in/${name}`,
		args: values.map(value => ({ type: "f", value }))
	};
	oscQueryBridge.sendPacket(writePacket(message));
};

export const sendPresetToRemote = (name: string): AppThunk =>
() => {
	const value = name;
	const message = {
		address: "/rnbo/inst/0/presets/load",
		args: [
			{ type: "s", value }
		]
	};
	console.log(message);
	oscQueryBridge.sendPacket(writePacket(message));
};

export const savePresetToRemote = (name: string): AppThunk =>
() => {
	const value = name;
	const message = {
		address: "/rnbo/inst/0/presets/save",
		args: [
			{ type: "s", value }
		]
	};
	console.log(message);
	oscQueryBridge.sendPacket(writePacket(message));
};

export const initializeDevice = (desc: AnyJson): AppThunk =>
(dispatch) => {
	try {
		// need to add presets here as well
		const parameterDescriptions = (desc as any).CONTENTS.params || {};
		const inportDescriptions = (desc as any).CONTENTS.messages?.CONTENTS.in || {};
		const presetDescriptions = (desc as any).CONTENTS.presets?.CONTENTS || {};

		dispatch(setEntities(
			EntityType.ParameterRecord,
			ParameterRecord.arrayFromDescription(parameterDescriptions)
		));
		dispatch(setEntities(
			EntityType.InportRecord,
			InportRecord.arrayFromDescription(inportDescriptions)
		));
		dispatch(setEntities(
			EntityType.PresetRecord,
			PresetRecord.arrayFromDescription(presetDescriptions)
		));

	} catch (e) {
		console.log(e);
	}
};
