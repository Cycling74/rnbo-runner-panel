import { writePacket } from "osc";
import { AnyJson } from "../lib/types";
import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { PresetRecord } from "../models/preset";
import { PatcherRecord } from "../models/patcher";
import { EntityType } from "../reducers/entities";
import { setEntities, setEntity } from "./entities";
import { AppThunk } from "../lib/store";
import throttle from "lodash.throttle";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { getParameter } from "../selectors/entities";

export const setParameterValueNormalized = (name: ParameterRecord["name"], value: number): AppThunk =>
	(dispatch, getState) => {
		const parameter = getParameter(getState(), name);
		if (!parameter) return;
		if (parameter.normalizedValue === value) return;
		dispatch(setEntity(EntityType.ParameterRecord, parameter.setNormalizedValue(value) ));
	};

export const setParameterValue = (name: ParameterRecord["name"], value: number): AppThunk =>
	(dispatch, getState) => {
		const parameter = getParameter(getState(), name);
		if (!parameter) return;
		if (parameter.value === value) return;
		dispatch(setEntity(EntityType.ParameterRecord, parameter.setValue(value) ));
	};

export const setRemoteParameterValueNormalized = throttle((name: string, value: number): AppThunk =>
	(dispatch, getState) => {

		const message = {
			address: `/rnbo/inst/0/params/${name}/normalized`,
			args: [
				{ type: "f", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));

		// optimistic local state update
		const parameter = getParameter(getState(), name);
		if (!parameter) return;
		dispatch(setEntity(EntityType.ParameterRecord, parameter.setNormalizedValue(value) ));

	}, 100);

export const triggerRemoteMidiNoteEvent = (pitch: number, isNoteOn: boolean): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = (isNoteOn ? 144 : 128) + midiChannel;
		const velocityByte = (isNoteOn ? 100 : 0);

		const message = {
			address: "/rnbo/inst/0/midi/in",
			args: [routeByte, pitch, velocityByte].map(byte => ({ type: "i", value: byte }))
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
		oscQueryBridge.sendPacket(writePacket(message));
	};

export const loadPatcher = (name: string, inst: number = 0): AppThunk =>
	() => {
		const message = {
			address: "/rnbo/inst/control/load",
			args: [
				{ type: "i", value: inst },
				{ type: "s", value: name }
			]
		};
		oscQueryBridge.sendPacket(writePacket(message));
	};

export const unloadPatcher = (inst: number = 0): AppThunk =>
	() => {
		const message = {
			address: "/rnbo/inst/control/unload",
			args: [
				{ type: "i", value: inst }
			]
		};
		oscQueryBridge.sendPacket(writePacket(message));
	};

export const initializeDevice = (desc: AnyJson): AppThunk =>
	(dispatch) => {
		try {
			const parameterDescriptions = (desc as any).CONTENTS.params || {};
			const inportDescriptions = (desc as any).CONTENTS.messages?.CONTENTS.in || {};
			const presetDescriptions = (desc as any).CONTENTS.presets?.CONTENTS || {};

			dispatch(setEntities(
				EntityType.ParameterRecord,
				ParameterRecord.arrayFromDescription(parameterDescriptions),
				true
			));
			dispatch(setEntities(
				EntityType.InportRecord,
				InportRecord.arrayFromDescription(inportDescriptions),
				true
			));
			dispatch(setEntities(
				EntityType.PresetRecord,
				PresetRecord.arrayFromDescription(presetDescriptions),
				true
			));

		} catch (e) {
			console.log(e);
		}
	};

export const initializePatchers = (desc: AnyJson): AppThunk =>
	(dispatch) => {
		try {
			const patcherDescriptions = (desc as any).CONTENTS || {};

			dispatch(setEntities( EntityType.PatcherRecord,
				PatcherRecord.arrayFromDescription(patcherDescriptions),
				true
			));

		} catch (e) {
			console.log(e);
		}
	};
