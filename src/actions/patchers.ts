import Router from "next/router";
import { ActionBase, AppThunk } from "../lib/store";
import { MIDIMetaMapping, OSCQueryRNBOInstance, OSCQueryRNBOInstanceDataRefs, OSCQueryRNBOInstancePresetEntries, OSCQueryRNBOInstancesState, OSCQueryRNBOPatchersState, OSCValue, ParameterMetaJsonMap } from "../lib/types";
import { PatcherInstanceRecord } from "../models/instance";
import { getPatcherInstance, getPatcherInstanceParametersByInstanceId, getPatcherInstanceMessageInportsByInstanceId, getPatcherInstanceMesssageOutportsByInstanceId, getPatcherInstanceMessageInportByPath, getPatcherInstanceMessageOutportByPath, getPatcherInstanceMesssageOutportsByInstanceIdAndTag, getPatcherInstanceParameterByPath, getPatcherInstanceParametersByInstanceIdAndName, getPatcherInstanceMessageInportsByInstanceIdAndTag, getPatcherInstances, getPatcherInstanceMessageInports, getPatcherInstanceMessageOutports, getPatcherInstanceParameters, getPatcherInstanceDataRefs, getPatcherInstanceDataRefsByInstanceIdAndName, getPatcherInstanceDataRefByPath, getPatcherInstanceDataRefsByInstanceId } from "../selectors/patchers";
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
import { cloneJSON, dayjs, getUniqueName, InvalidMIDIFormatError, parseMIDIMappingDisplayValue, UnknownMIDIFormatError, validateDataRefExportFilename, validatePatcherInstanceAlias, validatePresetName } from "../lib/util";
import { MIDIMetaMappingType } from "../lib/constants";
import { DialogResult, showConfirmDialog, showTextInputDialog } from "../lib/dialogs";
import { addPendingDataFile } from "./datafiles";
import { getDataFileByFilename, getPendingDataFileByFilename } from "../selectors/datafiles";

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
	DELETE_MESSAGE_OUTPORTS = "DELETE_MESSAGE_OUTPORTS",

	SET_DATA_REF = "SET_DATA_REF",
	SET_DATA_REFS = "SET_DATA_REFS",
	DELETE_DATA_REF = "DELETE_DATA_REF",
	DELETE_DATA_REFS = "DELETE_DATA_REFS"
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

export interface ISetInstanceDataRef extends ActionBase {
	type: PatcherActionType.SET_DATA_REF;
	payload: {
		ref: DataRefRecord;
	};
}

export interface ISetInstanceDataRefs extends ActionBase {
	type: PatcherActionType.SET_DATA_REFS;
	payload: {
		refs: DataRefRecord[];
	};
}

export interface IDeleteInstanceDataRef extends ActionBase {
	type: PatcherActionType.DELETE_DATA_REF;
	payload: {
		ref: DataRefRecord;
	};
}

export interface IDeleteInstanceDataRefs extends ActionBase {
	type: PatcherActionType.DELETE_DATA_REFS;
	payload: {
		refs: DataRefRecord[];
	};
}

export type InstanceAction = IInitPatchers | ISetInstance | ISetInstances | IDeleteInstance | IDeleteInstances |
ISetInstanceParameter | ISetInstanceParameters | IDeleteInstanceParameter | IDeleteInstanceParameters |
ISetInstanceMessageInport | ISetInstanceMessageInports | IDeleteInstanceMessageInport | IDeleteInstanceMessageInports |
ISetInstanceMessageOutport | ISetInstanceMessageOutports | IDeleteInstanceMessageOutport | IDeleteInstanceMessageOutports |
ISetInstanceDataRef | ISetInstanceDataRefs | IDeleteInstanceDataRef | IDeleteInstanceDataRefs;

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
	async (dispatch) => {
		try {

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to delete the patcher named ${patcher.name}? This action cannot be undone.`,
				actions: {
					confirm: { label: "Delete Patcher", color: "red" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

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

export const setInstanceDataRef = (ref: DataRefRecord): ISetInstanceDataRef => ({
	type: PatcherActionType.SET_DATA_REF,
	payload: {
		ref
	}
});

export const setInstanceDataRefs = (refs: DataRefRecord[]): ISetInstanceDataRefs => ({
	type: PatcherActionType.SET_DATA_REFS,
	payload: {
		refs
	}
});

export const deleteInstanceDataRef = (ref: DataRefRecord): IDeleteInstanceDataRef => ({
	type: PatcherActionType.DELETE_DATA_REF,
	payload: {
		ref
	}
});

export const deleteInstanceDataRefs = (refs: DataRefRecord[]): IDeleteInstanceDataRefs => ({
	type: PatcherActionType.DELETE_DATA_REFS,
	payload: {
		refs
	}
});

// Init from State
export const initInstances = (instanceInfo: OSCQueryRNBOInstancesState): AppThunk =>
	(dispatch, getState) => {

		const state = getState();

		const instances: PatcherInstanceRecord[] = [];
		const instanceParameters: ParameterRecord[] = [];
		const instanceMessageInports: MessagePortRecord[] = [];
		const instanceMessageOutports: MessagePortRecord[] = [];
		const instanceDataRefs: DataRefRecord[] = [];

		for (const [key, value] of Object.entries(instanceInfo.CONTENTS)) {
			if (!/^\d+$/.test(key)) continue;
			const info = value as OSCQueryRNBOInstance;
			const instance = PatcherInstanceRecord.fromDescription(info);
			instances.push(instance);
			instanceParameters.push(...ParameterRecord.fromDescription(instance.id, info.CONTENTS.params));
			instanceMessageInports.push(...MessagePortRecord.fromDescription(instance.id, info.CONTENTS.messages?.CONTENTS?.in));
			instanceMessageOutports.push(...MessagePortRecord.fromDescription(instance.id, info.CONTENTS.messages?.CONTENTS?.out));
			instanceDataRefs.push(...DataRefRecord.fromDescription(instance.id, info.CONTENTS.data_refs));
		}

		// Clean up existing state
		dispatch(deleteInstances(getPatcherInstances(state).valueSeq().toArray()));
		dispatch(deleteInstanceParameters(getPatcherInstanceParameters(state).valueSeq().toArray()));
		dispatch(deleteInstanceMessageInports(getPatcherInstanceMessageInports(state).valueSeq().toArray()));
		dispatch(deleteInstanceMessageOutports(getPatcherInstanceMessageOutports(state).valueSeq().toArray()));
		dispatch(deleteInstanceDataRefs(getPatcherInstanceDataRefs(state).valueSeq().toArray()));

		// Set New Instance State
		dispatch(setInstances(instances));
		dispatch(setInstanceParameters(instanceParameters));
		dispatch(setInstanceMessageInports(instanceMessageInports));
		dispatch(setInstanceMessageOutports(instanceMessageOutports));
		dispatch(setInstanceDataRefs(instanceDataRefs));
	};

// Trigger Events on Remote OSCQuery Runner
export const changeAliasOnRemoteInstance = (instance: PatcherInstanceRecord): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showTextInputDialog({
				actions: {
					confirm: { label: "Rename" },
					discard: { label: "Reset to Default" }
				},
				text: "Please name the device",
				label: "Device Name",
				validate: validatePatcherInstanceAlias,
				value: instance.displayName
			});

			if (dialogResult === DialogResult.Cancel) return;

			const message = {
				address: `${instance.path}/config/name_alias`,
				args: [
					{ type: "s", value: dialogResult === DialogResult.Discard ? "" : dialogResult }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to set alias for device ${instance.displayName}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

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

export const savePresetToRemoteInstance = (instance: PatcherInstanceRecord, givenName: string, ensureUniqueName: boolean = true): AppThunk =>
	(dispatch) => {
		try {
			const name = ensureUniqueName
				? getUniqueName(givenName, instance.presets.valueSeq().map(p => p.name).toArray())
				: givenName;

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

export const onOverwritePresetOnRemoteInstance = (instance: PatcherInstanceRecord, preset: PresetRecord): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to overwrite the preset named ${preset.name} with the current values?`,
				actions: {
					confirm: { label: "Overwrite Preset" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			dispatch(savePresetToRemoteInstance(instance, preset.name, false));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to overwrite preset ${preset.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const createPresetOnRemoteInstance = (instance: PatcherInstanceRecord): AppThunk =>
	async (dispatch) => {
		try {
			const dialogResult = await showTextInputDialog({
				text: `Please name the new preset for ${instance.displayName}`,
				label: "Preset Name",
				actions: {
					confirm: { label: "Create Preset" }
				},
				validate: validatePresetName
			});

			if (dialogResult === DialogResult.Cancel || dialogResult === DialogResult.Discard) {
				return;
			}

			dispatch(savePresetToRemoteInstance(instance, dialogResult, true));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to create preset",
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const destroyPresetOnRemoteInstance = (instance: PatcherInstanceRecord, preset: PresetRecord): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to delete the preset named ${preset.name}?`,
				actions: {
					confirm: { label: "Delete", color: "red" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

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

export const triggerSendInstanceInportMessage = (instance: PatcherInstanceRecord, port: MessagePortRecord): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showTextInputDialog({
				text: `Send Inport message to ${port.name}`,
				label: "Message",
				actions: {
					confirm: { label: "Send" }
				},
				validate: (value: string) => {
					if (!value.length) return "Empty input. Please provide a number or multiple numbers separated by spaces";
					const values = value.trim().replaceAll(",", ".").split(" ");
					if (values.find(v => isNaN(parseFloat(v)))) return "Please provide a number or multiple numbers separated by spaces";
					return true;
				}
			});

			if (dialogResult === DialogResult.Cancel || dialogResult === DialogResult.Discard) return;

			const values = dialogResult.split(" ").reduce((values, v) => {
				const fv = parseFloat(v.replaceAll(",", ".").trim());
				if (!isNaN(fv)) values.push({ type: "f", value: fv });
				return values;
			}, [] as OSCArgument[]);

			const message = {
				address: port.path,
				args: values
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to send values to inport ${port.name} on device ${instance.displayName}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const sendInstanceInportBang = (instance: PatcherInstanceRecord, port: MessagePortRecord): AppThunk =>
	(dispatch) => {
		try {
			const message: OSCMessage = {
				address: port.path,
				args: []
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to send bang to inport ${port.name} on device ${instance.displayName}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
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

export const setInstanceParameterValueNormalizedOnRemote = throttle((param: ParameterRecord, value: number): AppThunk =>
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

export const setInstanceParameterMetaOnRemote = (param: ParameterRecord, value: string): AppThunk =>
	() => {
		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const restoreDefaultParameterMetaOnRemote = (param: ParameterRecord): AppThunk =>
	() => {
		const message = {
			address: `${param.path}/meta`,
			args: [
				{ type: "s", value: "" }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setInstanceDataRefValueOnRemote = (dataref: DataRefRecord, file?: DataFileRecord): AppThunk =>
	() => {

		const message = {
			address: dataref.path,
			args: [
				{ type: "s", value: file?.fileName || "" } // no files unsets
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const clearInstanceDataRefValueOnRemote = (dataref: DataRefRecord): AppThunk =>
	async (dispatch, getState) => {

		const instance = getPatcherInstance(getState(), dataref.instanceId);
		if (!instance) return;

		const dialogResult = await showConfirmDialog({
			text: `Are you sure you want to clear the buffer mapping for ${ dataref.name } on ${instance.displayName}?`,
			actions: {
				confirm: { label: "Clear", color: "red" }
			}
		});

		if (dialogResult === DialogResult.Confirm) {
			dispatch(setInstanceDataRefValueOnRemote(dataref));
		}
	};

export const setInstanceDataRefMetaOnRemote = (dataref: DataRefRecord, value: string): AppThunk =>
	() => {
		const message = {
			address: `${dataref.path}/meta`,
			args: [
				{ type: "s", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const restoreDefaultDataRefMetaOnRemote = (dataref: DataRefRecord): AppThunk =>
	() => {
		const message = {
			address: `${dataref.path}/meta`,
			args: [
				{ type: "s", value: "" }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const exportInstanceDataRef = (dataref: DataRefRecord): AppThunk =>
	async (dispatch, getState) => {

		try {

			let filenameResult = await showTextInputDialog({
				text: `Please provide a filename to save the contents of ${dataref.name} to.`,
				label: "Filename",
				description: "Basename of the file without the .wav extension",
				actions: {
					confirm: { label: "Save" }
				},
				value: `${dayjs().format("YYMMDDTHHmmss")}-${dataref.name}`,
				validate: validateDataRefExportFilename
			});

			if (filenameResult === DialogResult.Cancel || filenameResult === DialogResult.Discard) return;
			filenameResult = filenameResult.replace(/\.wav$/, "");

			if (getDataFileByFilename(getState(), `${filenameResult}.wav`)) { // Already exists?!
				const overwriteResult = await showConfirmDialog({
					text: `A file with the name ${filenameResult}.wav already exists, are you sure you want to overwrite it?`,
					actions: {
						confirm: { label: "Overwrite"}
					}
				});
				if (overwriteResult !== DialogResult.Confirm) return;
			}

			if (getPendingDataFileByFilename(getState(), `${filenameResult}.wav`)) {
				return void await showConfirmDialog({
					text: `A file with the name ${filenameResult}.wav is currently being exported. Please provide a different filename.`,
					actions: {
						confirm: { label: "OK" }
					}
				});
			}


			const message = {
				address: `${dataref.path}/save`,
				args: [
					{ type: "s", value: filenameResult }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
			dispatch(addPendingDataFile(filenameResult));

		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to save contents of buffer ${dataref.name}`,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};

export const activateParameterMIDIMappingFocus = (param: ParameterRecord): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const params = getPatcherInstanceParametersByInstanceId(state, param.instanceId);

		dispatch(setInstanceParameters(
			params.valueSeq().toArray().map(p => p.setWaitingForMidiMapping(p.id === param.id))
		));
	};

export const clearParameterMIDIMappingOnRemote = (param: ParameterRecord): AppThunk =>
	async () => {

		const dialogResult = await showConfirmDialog({
			text: `Are you sure you want to remove the active MIDI mapping for ${param.name}?`,
			actions: {
				confirm: { label: "Remove MIDI Mapping" }
			}
		});

		if (dialogResult === DialogResult.Cancel) {
			// User Canceled, nothing to do
			return;
		}

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

export const setParameterMIDIMappingOnRemote = (param: ParameterRecord, type: MIDIMetaMappingType, mapping: MIDIMetaMapping): AppThunk =>
	() => {
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

export const setParameterMIDIMappingOnRemoteFromDisplayValue = (param: ParameterRecord, value: string): AppThunk =>
	(dispatch) => {
		try {
			const parsed = parseMIDIMappingDisplayValue(value);
			dispatch(setParameterMIDIMappingOnRemote(param, parsed.type, parsed.mapping));
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
export const addInstance = (desc: OSCQueryRNBOInstance): AppThunk =>
	(dispatch) => {
		const instance = PatcherInstanceRecord.fromDescription(desc);
		const parameters = ParameterRecord.fromDescription(instance.id, desc.CONTENTS.params);
		const messageInports = MessagePortRecord.fromDescription(instance.id, desc.CONTENTS.messages?.CONTENTS?.in);
		const messageOutports = MessagePortRecord.fromDescription(instance.id, desc.CONTENTS.messages?.CONTENTS?.out);
		const dataRefs = DataRefRecord.fromDescription(instance.id, desc.CONTENTS.data_refs);

		dispatch(setInstance(instance));
		dispatch(setInstanceParameters(parameters));
		dispatch(setInstanceMessageInports(messageInports));
		dispatch(setInstanceMessageOutports(messageOutports));
		dispatch(setInstanceDataRefs(dataRefs));
	};

export const updateInstanceAlias = (instanceId: PatcherInstanceRecord["id"], alias: string): AppThunk =>
	(dispatch, getState) => {
		const instance = getPatcherInstance(getState(), instanceId);
		if (!instance) return;
		dispatch(setInstance(instance.setAlias(alias)));
	};

export const deleteInstanceById = (instanceId: PatcherInstanceRecord["id"]): AppThunk =>
	(dispatch, getState) => {
		const instance = getPatcherInstance(getState(), instanceId);
		if (!instance) return;
		dispatch(deleteInstance(instance));
	};

export const updateInstancePresetEntries = (instanceId: string, entries: OSCQueryRNBOInstancePresetEntries): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;

			dispatch(setInstance(instance.updatePresets(entries)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstancePresetLatest = (instanceId: string, name: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;

			dispatch(setInstance(instance.setPresetLatest(name)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstancePresetInitial = (instanceId: string, name: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;

			dispatch(setInstance(instance.setPresetInitial(name)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessages = (instanceId: string, desc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;

			const currentMessageInports = getPatcherInstanceMessageInportsByInstanceId(state, instance.id);
			const currentMessageOutports = getPatcherInstanceMesssageOutportsByInstanceId(state, instance.id);
			dispatch(deleteInstanceMessageInports(currentMessageInports.valueSeq().toArray()));
			dispatch(deleteInstanceMessageOutports(currentMessageOutports.valueSeq().toArray()));

			const messageInports = MessagePortRecord.fromDescription(instance.id, desc.CONTENTS?.in);
			const messageOutports = MessagePortRecord.fromDescription(instance.id, desc.CONTENTS?.out);

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

export const updateInstanceMessageOutportValue = (instanceId: string, tag: MessagePortRecord["tag"], value: OSCValue | OSCValue[]): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			// Debug enabled?!
			const enabled = getAppSetting(state, AppSetting.debugMessageOutput)?.value || false;
			if (!enabled) return;

			// Active Instance view?!
			if (Router.pathname !== "/instances/[id]" || Router.query.id !== `${instanceId}`) return;

			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;

			const port = getPatcherInstanceMesssageOutportsByInstanceIdAndTag(state, instance.id, tag);
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

export const updateInstanceParameters = (instanceId: string, desc: OSCQueryRNBOInstance["CONTENTS"]["params"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;

			const currentParams = getPatcherInstanceParametersByInstanceId(state, instance.id);
			dispatch(deleteInstanceParameters(currentParams.valueSeq().toArray()));

			const newParams = ParameterRecord.fromDescription(instance.id, desc);
			dispatch(setInstanceParameters(newParams));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterValue = (instanceId: string, name: ParameterRecord["name"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const param = getPatcherInstanceParametersByInstanceIdAndName(state, instanceId, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setValue(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterValueNormalized = (instanceId: string, name: ParameterRecord["name"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const param = getPatcherInstanceParametersByInstanceIdAndName(state, instanceId, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setNormalizedValue(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceDataRefs = (instanceId: string, desc: OSCQueryRNBOInstanceDataRefs): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;

			const currentRefs = getPatcherInstanceDataRefsByInstanceId(state, instance.id);
			dispatch(deleteInstanceDataRefs(currentRefs.valueSeq().toArray()));

			const newRefs = DataRefRecord.fromDescription(instance.id, desc);
			dispatch(setInstanceDataRefs(newRefs));
		} catch (e) {
			console.log(e);
		}
	};

export const removeInstanceDataRefByPath = (path: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const dataRef = getPatcherInstanceDataRefByPath(state, path);
			if (!dataRef) return;

			dispatch(deleteInstanceDataRef(dataRef));
		} catch (e) {
			console.log(e);
		}
	};


export const updateInstanceDataRefValue = (instanceId: string, name: string, value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const dataRef = getPatcherInstanceDataRefsByInstanceIdAndName(state, instanceId, name);
			if (!dataRef) return;

			dispatch(setInstanceDataRef(dataRef.setValue(value)));
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
			const params = getPatcherInstanceParametersByInstanceId(state, instance.id).valueSeq().map(p => p.setWaitingForMidiMapping(false));
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

export const updateInstanceMIDIReport = (instanceId: string, value: boolean): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;
			dispatch(setInstance(instance.setWaitingForMapping(value)));
			const params = getPatcherInstanceParametersByInstanceId(state, instance.id).valueSeq().map(p => p.setWaitingForMidiMapping(false));
			dispatch(setInstanceParameters(params.toArray()));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMIDILastValue = (instanceId: string, value: string): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			const instance = getPatcherInstance(state, instanceId);
			if (!instance?.waitingForMidiMapping) return;

			const midiMeta = JSON.parse(value);

			// find waiting, update their meta, set them no longer waiting and update map
			const parameters: ParameterRecord[] = [];
			getPatcherInstanceParametersByInstanceId(state, instance.id).forEach(param => {
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

export const updateInstanceParameterMeta = (instanceId: string, name: ParameterRecord["name"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const param = getPatcherInstanceParametersByInstanceIdAndName(state, instanceId, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setMeta(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterDisplayName = (instanceId: string, name: ParameterRecord["name"], displayName: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const param = getPatcherInstanceParametersByInstanceIdAndName(state, instanceId, name);
			if (!param) return;

			dispatch(setInstanceParameter(param.setDisplayName(displayName)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageOutportMeta = (instanceId: string, tag: MessagePortRecord["tag"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;


			const port = getPatcherInstanceMessageInportsByInstanceIdAndTag(state, instance.id, tag);
			if (!port) return;

			dispatch(setInstanceMessageOutport(port.setMeta(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageInportMeta = (instanceId: string, tag: MessagePortRecord["tag"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) return;

			const port = getPatcherInstanceMessageInportsByInstanceIdAndTag(state, instance.id, tag);
			if (!port) return;

			dispatch(setInstanceMessageInport(port.setMeta(value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceDataRefMeta = (instanceId: string, name: DataRefRecord["name"], value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const dataRef = getPatcherInstanceDataRefsByInstanceIdAndName(state, instanceId, name);
			if (!dataRef) return;

			dispatch(setInstanceDataRef(dataRef.setMeta(value)));
		} catch (e) {
			console.log(e);
		}
	};
