import Router from "next/router";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancePresetEntries, OSCValue } from "../lib/types";
import { InstanceStateRecord } from "../models/instance";
import { getInstanceByIndex, getInstance, getParameter, getInstanceParameters, getInstanceParameterByName, getParameterByPath } from "../selectors/instances";
import { getAppSetting } from "../selectors/settings";
import { ParameterRecord } from "../models/parameter";
import { MessagePortRecord } from "../models/messageport";
import { OSCArgument, writePacket } from "osc";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import throttle from "lodash.throttle";
import { PresetRecord } from "../models/preset";
import { AppSetting } from "../models/settings";
import { DataRefRecord } from "../models/dataref";
import { DataFileRecord } from "../models/datafile";

export enum InstanceActionType {
	SET_INSTANCE = "SET_INSTANCE",
	SET_INSTANCES = "SET_INSTANCES",
	DELETE_INSTANCE = "DELETE_INSTANCE",
	DELETE_INSTANCES = "DELETE_INSTANCES",
	SET_PARAMETER = "SET_PARAMETER",
	SET_PARAMETERS = "SET_PARAMETERS",
	DELETE_PARAMETER = "DELETE_PARAMETER",
	DELETE_PARAMETERS = "DELETE_PARAMETERS"
}

export interface ISetInstance extends ActionBase {
	type: InstanceActionType.SET_INSTANCE;
	payload: {
		instance: InstanceStateRecord;
	};
}

export interface ISetInstances extends ActionBase {
	type: InstanceActionType.SET_INSTANCES;
	payload: {
		instances: InstanceStateRecord[];
	};
}

export interface IDeleteInstance extends ActionBase {
	type: InstanceActionType.DELETE_INSTANCE;
	payload: {
		instance: InstanceStateRecord;
	};
}

export interface IDeleteInstances extends ActionBase {
	type: InstanceActionType.DELETE_INSTANCES;
	payload: {
		instances: InstanceStateRecord[];
	};
}

export interface ISetInstanceParameter extends ActionBase {
	type: InstanceActionType.SET_PARAMETER;
	payload: {
		parameter: ParameterRecord;
	};
}

export interface ISetInstanceParameters extends ActionBase {
	type: InstanceActionType.SET_PARAMETERS;
	payload: {
		parameters: ParameterRecord[];
	};
}

export interface IDeleteInstanceParameter extends ActionBase {
	type: InstanceActionType.DELETE_PARAMETER;
	payload: {
		parameter: ParameterRecord;
	};
}

export interface IDeleteInstanceParameters extends ActionBase {
	type: InstanceActionType.DELETE_PARAMETERS;
	payload: {
		parameters: ParameterRecord[];
	};
}

export type InstanceAction = ISetInstance | ISetInstances | IDeleteInstance | IDeleteInstances |
ISetInstanceParameter | ISetInstanceParameters | IDeleteInstanceParameter | IDeleteInstanceParameters;

export const setInstance = (instance: InstanceStateRecord): ISetInstance => ({
	type: InstanceActionType.SET_INSTANCE,
	payload: {
		instance
	}
});

export const setInstances = (instances: InstanceStateRecord[]): ISetInstances => ({
	type: InstanceActionType.SET_INSTANCES,
	payload: {
		instances
	}
});

export const deleteInstance = (instance: InstanceStateRecord): IDeleteInstance => ({
	type: InstanceActionType.DELETE_INSTANCE,
	payload: {
		instance
	}
});

export const deleteInstances = (instances: InstanceStateRecord[]): IDeleteInstances => ({
	type: InstanceActionType.DELETE_INSTANCES,
	payload: {
		instances
	}
});

export const setInstanceParameter = (param: ParameterRecord): ISetInstanceParameter => ({
	type: InstanceActionType.SET_PARAMETER,
	payload: {
		parameter: param
	}
});

export const setInstanceParameters = (params: ParameterRecord[]): ISetInstanceParameters => ({
	type: InstanceActionType.SET_PARAMETERS,
	payload: {
		parameters: params
	}
});

export const deleteInstanceParameter = (param: ParameterRecord): IDeleteInstanceParameter => ({
	type: InstanceActionType.DELETE_PARAMETER,
	payload: {
		parameter: param
	}
});

export const deleteInstanceParameters = (params: ParameterRecord[]): IDeleteInstanceParameters => ({
	type: InstanceActionType.DELETE_PARAMETERS,
	payload: {
		parameters: params
	}
});

// Trigger Events on Remote OSCQuery Runner
export const loadPresetOnRemoteInstance = (instance: InstanceStateRecord, preset: PresetRecord): AppThunk =>
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

export const savePresetToRemoteInstance = (instance: InstanceStateRecord, name: string): AppThunk =>
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

export const destroyPresetOnRemoteInstance = (instance: InstanceStateRecord, preset: PresetRecord): AppThunk =>
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

export const renamePresetOnRemoteInstance = (instance: InstanceStateRecord, preset: PresetRecord, name: string): AppThunk =>
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

export const setInitialPresetOnRemoteInstance = (instance: InstanceStateRecord, preset: PresetRecord): AppThunk =>
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

export const sendInstanceMessageToRemote = (instance: InstanceStateRecord, inportId: string, value: string): AppThunk =>
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

export const triggerInstanceMidiNoteOnEventOnRemote = (instance: InstanceStateRecord, note: number): AppThunk =>
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

export const triggerInstanceMidiNoteOffEventOnRemote = (instance: InstanceStateRecord, note: number): AppThunk =>
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

export const setInstanceParameterValueNormalizedOnRemote = throttle((instance: InstanceStateRecord, param: ParameterRecord, value: number): AppThunk =>
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

export const setInstanceDataRefValueOnRemote = (instance: InstanceStateRecord, dataref: DataRefRecord, file?: DataFileRecord): AppThunk =>
	() => {

		const message = {
			address: `${instance.path}/data_refs/${dataref.id}`,
			args: [
				{ type: "s", value: file?.fileName || "" } // no files unsets
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setInstanceParameterMetaOnRemote = (_instance: InstanceStateRecord, param: ParameterRecord, value: string): AppThunk =>
	() => {
		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const restoreDefaultParameterMetaOnRemote = (_instance: InstanceStateRecord, param: ParameterRecord): AppThunk =>
	() => {
		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value: "" }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const activateParameterMIDIMappingFocus = (instance: InstanceStateRecord, param: ParameterRecord): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const params = getInstanceParameters(state, instance.index);

		dispatch(setInstanceParameters(
			params.valueSeq().toArray().map(p => p.setWaitingForMidiMapping(p.id === param.id))
		));
	};

export const clearParameterMidiMappingOnRemote = (id: InstanceStateRecord["id"], paramId: ParameterRecord["id"]): AppThunk =>
	(_dispatch, getState) => {
		const state = getState();
		const instance = getInstance(state, id);
		if (!instance) return;

		const param = getParameter(state, paramId);
		if (!param) return;

		const meta = param.getParsedMetaObject();
		delete meta.midi;
		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value: JSON.stringify(meta) }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setInstanceMessagePortMetaOnRemote = (_instance: InstanceStateRecord, port: MessagePortRecord, value: string): AppThunk =>
	() => {
		const message = {
			address: `${port.path}/meta`,
			args: [
				{ type: "s", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const restoreDefaultMessagePortMetaOnRemote = (_instance: InstanceStateRecord, port: MessagePortRecord): AppThunk =>
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
			const instance = getInstanceByIndex(state, index);
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
			const instance = getInstanceByIndex(state, index);
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
			const instance = getInstanceByIndex(state, index);
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
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(
				instance
					.set("messageInports", InstanceStateRecord.messagesFromDescription(desc.CONTENTS?.in))
					.set("messageOutports", InstanceStateRecord.messagesFromDescription(desc.CONTENTS?.out))
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageOutportValue = (index: number, name: string, value: OSCValue | OSCValue[]): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			// Debug enabled?!
			const enabled = getAppSetting(state, AppSetting.debugMessageOutput)?.value || false;
			if (!enabled) return;

			// Active Instance view?!
			if (Router.pathname !== "/instances/[index]" || Router.query.index !== `${index}`) return;

			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(
				instance.setMessageOutportValue(name, Array.isArray(value) ? value.join(", ") : `${value}`)
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameters = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["params"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			const currentParams = getInstanceParameters(state, instance.index);
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

			const instance = getInstanceByIndex(state, index);
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
			const param = getInstanceParameterByName(state, index, name);
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
			const param = getInstanceParameterByName(state, index, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setNormalizedValue(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const setInstanceWaitingForMidiMappingOnRemote = (id: InstanceStateRecord["id"], value: boolean): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getInstance(state, id);
			if (!instance) return;

			dispatch(setInstance(instance.setWaitingForMapping(value)));
			const params = getInstanceParameters(state, instance.index).valueSeq().map(p => p.setWaitingForMidiMapping(false));
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
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;
			dispatch(setInstance(instance.setWaitingForMapping(value)));
			const params = getInstanceParameters(state, instance.index).valueSeq().map(p => p.setWaitingForMidiMapping(false));
			dispatch(setInstanceParameters(params.toArray()));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMIDILastValue = (index: number, value: string): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			const instance = getInstanceByIndex(state, index);
			if (!instance?.waitingForMidiMapping) return;

			const midiMeta = JSON.parse(value);

			// find waiting, update their meta, set them no longer waiting and update map
			const parameters: ParameterRecord[] = [];
			getInstanceParameters(state, instance.index).forEach(param => {
				if (param.waitingForMidiMapping) {
					const meta = param.getParsedMetaObject();
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
			const param = getInstanceParameterByName(state, index, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setMeta(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageOutportMeta = (index: number, id: MessagePortRecord["id"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.setMessageOutportMeta(id, value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageInportMeta = (index: number, id: MessagePortRecord["id"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.setMessageInportMeta(id, value)));
		} catch (e) {
			console.log(e);
		}
	};

// Events from remote
