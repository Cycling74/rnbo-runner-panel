import { writePacket } from "osc";
import { AnyJson } from "../lib/types";
import { InportRecord } from "../models/inport";
import { ParameterRecord } from "../models/parameter";
import { PresetRecord } from "../models/preset";
import { PatcherRecord, UNLOAD_PATCHER_NAME } from "../models/patcher";
import { EntityType } from "../reducers/entities";
import { setEntities, setEntity } from "./entities";
import { AppThunk } from "../lib/store";
import throttle from "lodash.throttle";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { getParameter, getPatchers } from "../selectors/entities";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";

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

export const loadPresetOnRemote = (preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/0/presets/load",
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
			dispatch(showNotification({
				level: NotificationLevel.success,
				title: "Preset loaded",
				message: `Preset "${preset.name} has been loaded.`
			}));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load preset ${preset.name}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};

export const savePresetToRemote = (name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/0/presets/save",
				args: [
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
			dispatch(showNotification({
				level: NotificationLevel.success,
				title: "Preset saved",
				message: `Preset "${name} has been saved.`
			}));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to save preset ${name}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};

export const loadPatcher = (patcher: PatcherRecord, inst: number = 0): AppThunk =>
	(dispatch) => {
		try {
			let message;
			if (patcher.name === UNLOAD_PATCHER_NAME) {
				message = {
					address: "/rnbo/inst/control/unload",
					args: [
						{ type: "i", value: inst }
					]
				};
			} else {
				message = {
					address: "/rnbo/inst/control/load",
					args: [
						{ type: "i", value: inst },
						{ type: "s", value: patcher.name }
					]
				};
			}
			oscQueryBridge.sendPacket(writePacket(message));
			dispatch(showNotification({
				level: NotificationLevel.success,
				title: patcher.name === UNLOAD_PATCHER_NAME ?  "Unloaded patcher" : "Loaded patcher",
				message: patcher.name === UNLOAD_PATCHER_NAME ? "" : `The patcher ${patcher.name} has been loaded`
			}));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: patcher.name === UNLOAD_PATCHER_NAME ? "Error while trying to unload patcher" : `Error while trying to load patcher ${patcher.name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const updatePresets = (entries?: any): AppThunk =>
	(dispatch) => {
		try {
			dispatch(setEntities(
				EntityType.PresetRecord,
				PresetRecord.arrayFromDescription(entries),
				true
			));
		} catch (e) {
			console.log(e);
		}
	};

export const setSelectedPatcher = (name: string): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		try {
			const updated: PatcherRecord[] = getPatchers(state).reduce((c, p) => {
				return c.concat(new PatcherRecord ({name: p.name, loaded: p.name === name}));
			}, []);
			dispatch(setEntities(EntityType.PatcherRecord, updated, true));
		} catch (e) {
			console.log(e);
		}
	};

export const initializeDevice = (desc: AnyJson): AppThunk =>
	(dispatch) => {
		try {
			const parameterDescriptions = (desc as any).CONTENTS.params || {};
			const inportDescriptions = (desc as any).CONTENTS.messages?.CONTENTS.in || {};
			const presetDescriptions = (desc as any).CONTENTS.presets?.CONTENTS || {};
			const patcherName: string | undefined = (desc as any).CONTENTS.name?.VALUE;

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
				PresetRecord.arrayFromDescription(presetDescriptions?.entries?.VALUE as any),
				true
			));

			dispatch(setSelectedPatcher(patcherName));
		} catch (e) {
			console.log(e);
		}
	};

export const initializePatchers = (desc: AnyJson): AppThunk =>
	(dispatch, getState) => {
		try {
			const patcherDescriptions = (desc as any).CONTENTS || {};
			const loadedName: string | undefined = getPatchers(getState()).reduce((c, p) => {
				return p.loaded ? p.name : c;
			}, undefined);

			dispatch(setEntities( EntityType.PatcherRecord,
				PatcherRecord.arrayFromDescription(patcherDescriptions, loadedName),
				true
			));

		} catch (e) {
			console.log(e);
		}
	};
