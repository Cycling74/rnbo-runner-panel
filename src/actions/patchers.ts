import Router from "next/router";
import { ActionBase, AppThunk } from "../lib/store";
import { MIDIMetaMapping, OSCQueryRNBOInstance, OSCQueryRNBOInstancePresetEntries, OSCQueryRNBOPatchersState, OSCValue, ParameterMetaJsonMap } from "../lib/types";
import { PatcherInstanceRecord } from "../models/instance";
import { getPatcherInstanceByIndex, getPatcherInstance, getPatcherInstanceParametersByInstanceIndex, getPatcherInstanceParameter, getPatcherInstanceMessageInportsByInstanceIndex, getPatcherInstanceMesssageOutportsByInstanceIndex, getPatcherInstanceMessageInportByPath, getPatcherInstanceMessageOutportByPath, getPatcherInstanceMesssageOutportsByInstanceIndexAndTag, getPatcherInstanceParameterByPath, getPatcherInstanceParametersByInstanceIndexAndName, getPatcherInstanceMessageInportsByInstanceIndexAndTag } from "../selectors/patchers";
import { getAppSetting } from "../selectors/settings";
import { ParameterRecord } from "../models/parameter";
import { MessagePortRecord } from "../models/messageport";
import { OSCArgument, OSCMessage, writePacket } from "osc";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import throttle from "lodash.throttle";
import { PresetRecord } from "../models/preset";
import { AppSetting } from "../models/settings";
import { DataRefRecord } from "../models/dataref";
import { DataFileRecord } from "../models/datafile";
import { PatcherExportRecord } from "../models/patcher";
import { cloneJSON, InvalidMIDIFormatError, parseMIDIMappingDisplayValue, UnknownMIDIFormatError } from "../lib/util";
import { MIDIMetaMappingType } from "../lib/constants";

export enum PatcherActionType {
	INIT_PATCHERS = "INIT_PATCHERS",

	SET_INSTANCE = "SET_INSTANCE",
	SET_INSTANCES = "SET_INSTANCES",
	DELETE_INSTANCE = "DELETE_INSTANCE",
	DELETE_INSTANCES = "DELETE_INSTANCES",

	SET_PARAMETER = "SET_PARAMETER",
	SET_PARAMETERS = "SET_PARAMETERS",
	DELETE_PARAMETER = "DELETE_PARAMETER",
	DELETE_PARAMETERS = "DELETE_PARAMETERS",

	SET_MESSAGE_INPORT = "SET_MESSAGE_INPORT",
	SET_MESSAGE_INPORTS = "SET_MESSAGE_INPORTS",
	DELETE_MESSAGE_INPORT = "DELETE_MESSAGE_INPORT",
	DELETE_MESSAGE_INPORTS = "DELETE_MESSAGE_INPORTS",

	SET_MESSAGE_OUTPORT = "SET_MESSAGE_OUTPORT",
	SET_MESSAGE_OUTPORTS = "SET_MESSAGE_OUTPORTS",
	DELETE_MESSAGE_OUTPORT = "DELETE_MESSAGE_OUTPORT",
	DELETE_MESSAGE_OUTPORTS = "DELETE_MESSAGE_OUTPORTS"
}

export interface IInitPatchers extends ActionBase {
	type: PatcherActionType.INIT_PATCHERS;
	payload: {
		patchers: PatcherExportRecord[];
	};
}

export interface ISetInstance extends ActionBase {
	type: PatcherActionType.SET_INSTANCE;
	payload: {
		instance: PatcherInstanceRecord;
	};
}

export interface ISetInstances extends ActionBase {
	type: PatcherActionType.SET_INSTANCES;
	payload: {
		instances: PatcherInstanceRecord[];
	};
}

export interface IDeleteInstance extends ActionBase {
	type: PatcherActionType.DELETE_INSTANCE;
	payload: {
		instance: PatcherInstanceRecord;
	};
}

export interface IDeleteInstances extends ActionBase {
	type: PatcherActionType.DELETE_INSTANCES;
	payload: {
		instances: PatcherInstanceRecord[];
	};
}

export interface ISetInstanceParameter extends ActionBase {
	type: PatcherActionType.SET_PARAMETER;
	payload: {
		parameter: ParameterRecord;
	};
}

export interface ISetInstanceParameters extends ActionBase {
	type: PatcherActionType.SET_PARAMETERS;
	payload: {
		parameters: ParameterRecord[];
	};
}

export interface IDeleteInstanceParameter extends ActionBase {
	type: PatcherActionType.DELETE_PARAMETER;
	payload: {
		parameter: ParameterRecord;
	};
}

export interface IDeleteInstanceParameters extends ActionBase {
	type: PatcherActionType.DELETE_PARAMETERS;
	payload: {
		parameters: ParameterRecord[];
	};
}

export interface ISetInstanceMessageInport extends ActionBase {
	type: PatcherActionType.SET_MESSAGE_INPORT;
	payload: {
		port: MessagePortRecord;
	};
}

export interface ISetInstanceMessageInports extends ActionBase {
	type: PatcherActionType.SET_MESSAGE_INPORTS;
	payload: {
		ports: MessagePortRecord[];
	};
}

export interface IDeleteInstanceMessageInport extends ActionBase {
	type: PatcherActionType.DELETE_MESSAGE_INPORT;
	payload: {
		port: MessagePortRecord;
	};
}

export interface IDeleteInstanceMessageInports extends ActionBase {
	type: PatcherActionType.DELETE_MESSAGE_INPORTS;
	payload: {
		ports: MessagePortRecord[];
	};
}

export interface ISetInstanceMessageOutport extends ActionBase {
	type: PatcherActionType.SET_MESSAGE_OUTPORT;
	payload: {
		port: MessagePortRecord;
	};
}

export interface ISetInstanceMessageOutports extends ActionBase {
	type: PatcherActionType.SET_MESSAGE_OUTPORTS;
	payload: {
		ports: MessagePortRecord[];
	};
}

export interface IDeleteInstanceMessageOutport extends ActionBase {
	type: PatcherActionType.DELETE_MESSAGE_OUTPORT;
	payload: {
		port: MessagePortRecord;
	};
}

export interface IDeleteInstanceMessageOutports extends ActionBase {
	type: PatcherActionType.DELETE_MESSAGE_OUTPORTS;
	payload: {
		ports: MessagePortRecord[];
	};
}

export type InstanceAction = IInitPatchers | ISetInstance | ISetInstances | IDeleteInstance | IDeleteInstances |
ISetInstanceParameter | ISetInstanceParameters | IDeleteInstanceParameter | IDeleteInstanceParameters |
ISetInstanceMessageInport | ISetInstanceMessageInports | IDeleteInstanceMessageInport | IDeleteInstanceMessageInports |
ISetInstanceMessageOutport | ISetInstanceMessageOutports | IDeleteInstanceMessageOutport | IDeleteInstanceMessageOutports;

export const initPatchers = (patchersInfo: OSCQueryRNBOPatchersState): IInitPatchers => {

	const patchers: PatcherExportRecord[] = [];
	for (const [name, desc] of Object.entries(patchersInfo.CONTENTS || {})) {
		patchers.push(PatcherExportRecord.fromDescription(name, desc));
	}

	return {
		type: PatcherActionType.INIT_PATCHERS,
		payload: {
			patchers
		}
	};
};

export const destroyPatcherOnRemote = (patcher: PatcherExportRecord): AppThunk =>
	(dispatch) => {
		try {
			const message: OSCMessage = {
				address: `/rnbo/patchers/${patcher.name}/destroy`,
				args: []
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete patcher ${patcher.name}`,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};


export const renamePatcherOnRemote = (patcher: PatcherExportRecord, newName: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `/rnbo/patchers/${patcher.name}/rename`,
				args: [
					{ type: "s", value: newName }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to rename patcher ${patcher.name} -> ${newName}`,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};


export const setInstance = (instance: PatcherInstanceRecord): ISetInstance => ({
	type: PatcherActionType.SET_INSTANCE,
	payload: {
		instance
	}
});

export const setInstances = (instances: PatcherInstanceRecord[]): ISetInstances => ({
	type: PatcherActionType.SET_INSTANCES,
	payload: {
		instances
	}
});

export const deleteInstance = (instance: PatcherInstanceRecord): IDeleteInstance => ({
	type: PatcherActionType.DELETE_INSTANCE,
	payload: {
		instance
	}
});

export const deleteInstances = (instances: PatcherInstanceRecord[]): IDeleteInstances => ({
	type: PatcherActionType.DELETE_INSTANCES,
	payload: {
		instances
	}
});

export const setInstanceParameter = (param: ParameterRecord): ISetInstanceParameter => ({
	type: PatcherActionType.SET_PARAMETER,
	payload: {
		parameter: param
	}
});

export const setInstanceParameters = (params: ParameterRecord[]): ISetInstanceParameters => ({
	type: PatcherActionType.SET_PARAMETERS,
	payload: {
		parameters: params
	}
});

export const deleteInstanceParameter = (param: ParameterRecord): IDeleteInstanceParameter => ({
	type: PatcherActionType.DELETE_PARAMETER,
	payload: {
		parameter: param
	}
});

export const deleteInstanceParameters = (params: ParameterRecord[]): IDeleteInstanceParameters => ({
	type: PatcherActionType.DELETE_PARAMETERS,
	payload: {
		parameters: params
	}
});

export const setInstanceMessageInport = (port: MessagePortRecord): ISetInstanceMessageInport => ({
	type: PatcherActionType.SET_MESSAGE_INPORT,
	payload: {
		port
	}
});

export const setInstanceMessageInports = (ports: MessagePortRecord[]): ISetInstanceMessageInports => ({
	type: PatcherActionType.SET_MESSAGE_INPORTS,
	payload: {
		ports
	}
});

export const deleteInstanceMessageInport = (port: MessagePortRecord): IDeleteInstanceMessageInport => ({
	type: PatcherActionType.DELETE_MESSAGE_INPORT,
	payload: {
		port
	}
});

export const deleteInstanceMessageInports = (ports: MessagePortRecord[]): IDeleteInstanceMessageInports => ({
	type: PatcherActionType.DELETE_MESSAGE_INPORTS,
	payload: {
		ports
	}
});

export const setInstanceMessageOutport = (port: MessagePortRecord): ISetInstanceMessageOutport => ({
	type: PatcherActionType.SET_MESSAGE_OUTPORT,
	payload: {
		port
	}
});

export const setInstanceMessageOutports = (ports: MessagePortRecord[]): ISetInstanceMessageOutports => ({
	type: PatcherActionType.SET_MESSAGE_OUTPORTS,
	payload: {
		ports
	}
});

export const deleteInstanceMessageOutport = (port: MessagePortRecord): IDeleteInstanceMessageOutport => ({
	type: PatcherActionType.DELETE_MESSAGE_OUTPORT,
	payload: {
		port
	}
});

export const deleteInstanceMessageOutports = (ports: MessagePortRecord[]): IDeleteInstanceMessageOutports => ({
	type: PatcherActionType.DELETE_MESSAGE_OUTPORTS,
	payload: {
		ports
	}
});

// Trigger Events on Remote OSCQuery Runner
export const loadPresetOnRemoteInstance = (instance: PatcherInstanceRecord, preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/load`,
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load preset ${preset.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const savePresetToRemoteInstance = (instance: PatcherInstanceRecord, name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/save`,
				args: [
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to save preset ${name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const destroyPresetOnRemoteInstance = (instance: PatcherInstanceRecord, preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/delete`,
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete preset ${preset.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const renamePresetOnRemoteInstance = (instance: PatcherInstanceRecord, preset: PresetRecord, name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/rename`,
				args: [
					{ type: "s", value: preset.name },
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to rename preset ${preset.name} to ${name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const setInitialPresetOnRemoteInstance = (instance: PatcherInstanceRecord, preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/initial`,
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to set initial preset to ${preset.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const sendInstanceMessageToRemote = (instance: PatcherInstanceRecord, inportId: string, value: string): AppThunk =>
	(dispatch) => {
		const values = value.split(" ").reduce((values, v) => {
			const fv = parseFloat(v.replaceAll(",", ".").trim());
			if (!isNaN(fv)) values.push({ type: "f", value: fv });
			return values;
		}, [] as OSCArgument[]);

		if (!values.length) {
			dispatch(showNotification({
				title: "Invalid Message Input",
				level: NotificationLevel.warn,
				message: `Could not send message input "${value}" as it appears to contain non-valid number input. Please provide a single or multiple numbers separated by a space.`
			}));
			return;
		}


		const message = {
			address: `/rnbo/inst/${instance.index}/messages/in/${inportId}`,
			args: values
		};
		oscQueryBridge.sendPacket(writePacket(message));
	};

export const triggerInstanceMidiNoteOnEventOnRemote = (instance: PatcherInstanceRecord, note: number): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = 144 + midiChannel;
		const velocityByte = 100;

		const message = {
			address: `${instance.path}/midi/in`,
			args: [routeByte, note, velocityByte].map(byte => ({ type: "i", value: byte }))
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const triggerInstanceMidiNoteOffEventOnRemote = (instance: PatcherInstanceRecord, note: number): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = 128 + midiChannel;
		const velocityByte = 0;

		const message = {
			address: `${instance.path}/midi/in`,
			args: [routeByte, note, velocityByte].map(byte => ({ type: "i", value: byte }))
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setInstanceParameterValueNormalizedOnRemote = throttle((instance: PatcherInstanceRecord, param: ParameterRecord, value: number): AppThunk =>
	(dispatch) => {

		const message = {
			address: `${param.path}/normalized`,
			args: [
				{ type: "f", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
		// optimistic local state update
		dispatch(setInstanceParameter(param.setNormalizedValue(value)));
	}, 10);

export const setInstanceDataRefValueOnRemote = (instance: PatcherInstanceRecord, dataref: DataRefRecord, file?: DataFileRecord): AppThunk =>
	() => {

		const message = {
			address: `${instance.path}/data_refs/${dataref.id}`,
			args: [
				{ type: "s", value: file?.fileName || "" } // no files unsets
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setInstanceParameterMetaOnRemote = (_instance: PatcherInstanceRecord, param: ParameterRecord, value: string): AppThunk =>
	() => {
		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const restoreDefaultParameterMetaOnRemote = (_instance: PatcherInstanceRecord, param: ParameterRecord): AppThunk =>
	() => {
		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value: "" }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const activateParameterMIDIMappingFocus = (instance: PatcherInstanceRecord, param: ParameterRecord): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const params = getPatcherInstanceParametersByInstanceIndex(state, instance.index);

		dispatch(setInstanceParameters(
			params.valueSeq().toArray().map(p => p.setWaitingForMidiMapping(p.id === param.id))
		));
	};

export const clearParameterMIDIMappingOnRemote = (id: PatcherInstanceRecord["id"], paramId: ParameterRecord["id"]): AppThunk =>
	(_dispatch, getState) => {
		const state = getState();
		const instance = getPatcherInstance(state, id);
		if (!instance) return;

		const param = getPatcherInstanceParameter(state, paramId);
		if (!param) return;

		const meta = cloneJSON(param.meta);
		delete meta.midi;

		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value: JSON.stringify(meta) }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setParameterMIDIMappingOnRemote = (id: PatcherInstanceRecord["id"], paramId: ParameterRecord["id"], type: MIDIMetaMappingType, mapping: MIDIMetaMapping): AppThunk =>
	(_dispatch, getState) => {
		const state = getState();
		const instance = getPatcherInstance(state, id);
		if (!instance) return;

		const param = getPatcherInstanceParameter(state, paramId);
		if (!param) return;

		const meta: ParameterMetaJsonMap = cloneJSON(param.meta);
		meta.midi = { ...mapping };

		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value: JSON.stringify(meta) }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setParameterMIDIMappingOnRemoteFromDisplayValue = (id: PatcherInstanceRecord["id"], paramId: ParameterRecord["id"], value: string): AppThunk =>
	(dispatch) => {
		try {
			const parsed = parseMIDIMappingDisplayValue(value);
			dispatch(setParameterMIDIMappingOnRemote(id, paramId, parsed.type, parsed.mapping));
		} catch (err: unknown) {
			let notification: { level: NotificationLevel; message: string; title: string };
			if (err instanceof InvalidMIDIFormatError) {
				notification = {
					title: err.message,
					message: `"${value}" is not a valid MIDI mapping value`,
					level: NotificationLevel.error
				};
			} else if (err instanceof UnknownMIDIFormatError) {
				notification = {
					title: err.message,
					message: `"${value}" is an unknown MIDI mapping format. Please use the parameter meta editor to set this mapping.`,
					level: NotificationLevel.warn
				};
			} else {
				notification = {
					title: "Unexpected Error",
					message: `Encountered an unexpected error while trying to set "${value}" as the MIDI mapping`,
					level: NotificationLevel.error
				};
				console.error(err);
			}
			return void dispatch(showNotification(notification));
		}
	};

export const setInstanceMessagePortMetaOnRemote = (_instance: PatcherInstanceRecord, port: MessagePortRecord, value: string): AppThunk =>
	() => {
		const message = {
			address: `${port.path}/meta`,
			args: [
				{ type: "s", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const restoreDefaultMessagePortMetaOnRemote = (_instance: PatcherInstanceRecord, port: MessagePortRecord): AppThunk =>
	() => {
		const message = {
			address: `${port.path}/meta`,
			args: [
				{ type: "s", value: "" }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

// Updates in response to remote OSCQuery Updates
export const updateInstancePresetEntries = (index: number, entries: OSCQueryRNBOInstancePresetEntries): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.updatePresets(entries)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstancePresetLatest = (index: number, name: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.setPresetLatest(name)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstancePresetInitial = (index: number, name: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.setPresetInitial(name)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessages = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;

			const currentMessageInports = getPatcherInstanceMessageInportsByInstanceIndex(state, instance.index);
			const currentMessageOutports = getPatcherInstanceMesssageOutportsByInstanceIndex(state, instance.index);
			dispatch(deleteInstanceMessageInports(currentMessageInports.valueSeq().toArray()));
			dispatch(deleteInstanceMessageOutports(currentMessageOutports.valueSeq().toArray()));

			const messageInports = MessagePortRecord.fromDescription(instance.index, desc.CONTENTS?.in);
			const messageOutports = MessagePortRecord.fromDescription(instance.index, desc.CONTENTS?.out);

			dispatch(setInstanceMessageInports(messageInports));
			dispatch(setInstanceMessageOutports(messageOutports));

		} catch (e) {
			console.log(e);
		}
	};

export const removeInstanceMessageInportByPath = (path: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const port = getPatcherInstanceMessageInportByPath(state, path);
			if (!port) return;

			dispatch(deleteInstanceMessageInport(port));
		} catch (e) {
			console.log(e);
		}
	};

export const removeInstanceMessageOutportByPath = (path: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const port = getPatcherInstanceMessageOutportByPath(state, path);
			if (!port) return;

			dispatch(deleteInstanceMessageOutport(port));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageOutportValue = (index: number, tag: MessagePortRecord["tag"], value: OSCValue | OSCValue[]): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			// Debug enabled?!
			const enabled = getAppSetting(state, AppSetting.debugMessageOutput)?.value || false;
			if (!enabled) return;

			// Active Instance view?!
			if (Router.pathname !== "/instances/[index]" || Router.query.index !== `${index}`) return;

			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;

			const port = getPatcherInstanceMesssageOutportsByInstanceIndexAndTag(state, instance.index, tag);
			if (!port) return;

			dispatch(setInstanceMessageOutport(port.setValue(Array.isArray(value) ? value.join(", ") : `${value}`)));
		} catch (e) {
			console.log(e);
		}
	};

export const removeInstanceParameterByPath = (path: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const param = getPatcherInstanceParameterByPath(state, path);
			if (!param) return;

			dispatch(deleteInstanceParameter(param));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameters = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["params"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;

			const currentParams = getPatcherInstanceParametersByInstanceIndex(state, instance.index);
			dispatch(deleteInstanceParameters(currentParams.valueSeq().toArray()));

			const newParams = ParameterRecord.fromDescription(instance.index, desc);
			dispatch(setInstanceParameters(newParams));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceDataRefValue = (index: number, name: string, value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(
				instance.setDataRefValue(name, value)
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterValue = (index: number, name: ParameterRecord["name"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const param = getPatcherInstanceParametersByInstanceIndexAndName(state, index, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setValue(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterValueNormalized = (index: number, name: ParameterRecord["name"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const param = getPatcherInstanceParametersByInstanceIndexAndName(state, index, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setNormalizedValue(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const setInstanceWaitingForMidiMappingOnRemote = (id: PatcherInstanceRecord["id"], value: boolean): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstance(state, id);
			if (!instance) return;

			dispatch(setInstance(instance.setWaitingForMapping(value)));
			const params = getPatcherInstanceParametersByInstanceIndex(state, instance.index).valueSeq().map(p => p.setWaitingForMidiMapping(false));
			dispatch(setInstanceParameters(params.toArray()));

			try {
				const message = {
					address: `${instance.path}/midi/last/report`,
					args: [
						{ type: value ? "T" : "F", value: value ? "true" : "false" }
					]
				};
				oscQueryBridge.sendPacket(writePacket(message));
			} catch (err) {
				dispatch(showNotification({
					level: NotificationLevel.error,
					title: "Error while trying set midi mapping mode on remote",
					message: "Please check the console for further details."
				}));
				console.log(err);
			}
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMIDIReport = (index: number, value: boolean): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;
			dispatch(setInstance(instance.setWaitingForMapping(value)));
			const params = getPatcherInstanceParametersByInstanceIndex(state, instance.index).valueSeq().map(p => p.setWaitingForMidiMapping(false));
			dispatch(setInstanceParameters(params.toArray()));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMIDILastValue = (index: number, value: string): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance?.waitingForMidiMapping) return;

			const midiMeta = JSON.parse(value);

			// find waiting, update their meta, set them no longer waiting and update map
			const parameters: ParameterRecord[] = [];
			getPatcherInstanceParametersByInstanceIndex(state, instance.index).forEach(param => {
				if (param.waitingForMidiMapping) {
					const meta = cloneJSON(param.meta);
					meta.midi = midiMeta;

					const message = {
						address: `${param.path}/meta`,
						args: [
							{ type: "s", value: JSON.stringify(meta) }
						]
					};

					oscQueryBridge.sendPacket(writePacket(message));
					parameters.push(param.setWaitingForMidiMapping(false));
				}
			});

			dispatch(setInstanceParameters(parameters));

		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterMeta = (index: number, name: ParameterRecord["name"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const param = getPatcherInstanceParametersByInstanceIndexAndName(state, index, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setMeta(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageOutportMeta = (index: number, tag: MessagePortRecord["tag"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;


			const port = getPatcherInstanceMessageInportsByInstanceIndexAndTag(state, instance.index, tag);
			if (!port) return;

			dispatch(setInstanceMessageOutport(port.setMeta(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageInportMeta = (index: number, tag: MessagePortRecord["tag"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstanceByIndex(state, index);
			if (!instance) return;

			const port = getPatcherInstanceMessageInportsByInstanceIndexAndTag(state, instance.index, tag);
			if (!port) return;

			dispatch(setInstanceMessageInport(port.setMeta(value)));
		} catch (e) {
			console.log(e);
		}
	};

// Events from remote
