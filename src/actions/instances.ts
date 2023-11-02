import Router from "next/router";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancePresetEntries, OSCValue } from "../lib/types";
import { DeviceStateRecord } from "../models/device";
import { Setting } from "../reducers/settings";
import { getDeviceByIndex } from "../selectors/instances";
import { getSetting } from "../selectors/settings";
import { ParameterRecord } from "../models/parameter";
import { OSCArgument, writePacket } from "osc";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import throttle from "lodash.throttle";
import { PresetRecord } from "../models/preset";

export enum InstanceActionType {
	SET_DEVICE = "SET_DEVICE",
	SET_DEVICES = "SET_DEVICES",
	DELETE_DEVICE = "DELETE_DEVICE",
	DELETE_DEVICES = "DELETE_DEVICES"
}

export interface ISetDevice extends ActionBase {
	type: InstanceActionType.SET_DEVICE;
	payload: {
		device: DeviceStateRecord;
	};
}

export interface ISetDevices extends ActionBase {
	type: InstanceActionType.SET_DEVICES;
	payload: {
		devices: DeviceStateRecord[];
	};
}

export interface IDeleteDevice extends ActionBase {
	type: InstanceActionType.DELETE_DEVICE;
	payload: {
		device: DeviceStateRecord;
	};
}

export interface IDeleteDevices extends ActionBase {
	type: InstanceActionType.DELETE_DEVICES;
	payload: {
		devices: DeviceStateRecord[];
	};
}

export type InstanceAction = ISetDevice | ISetDevices | IDeleteDevice | IDeleteDevices;

export const setDevice = (device: DeviceStateRecord): ISetDevice => ({
	type: InstanceActionType.SET_DEVICE,
	payload: {
		device
	}
});

export const setDevices = (devices: DeviceStateRecord[]): ISetDevices => ({
	type: InstanceActionType.SET_DEVICES,
	payload: {
		devices
	}
});

export const deleteDevice = (device: DeviceStateRecord): IDeleteDevice => ({
	type: InstanceActionType.DELETE_DEVICE,
	payload: {
		device
	}
});

export const deleteDevices = (devices: DeviceStateRecord[]): IDeleteDevices => ({
	type: InstanceActionType.DELETE_DEVICES,
	payload: {
		devices
	}
});

// Trigger Events on Remote OSCQuery Runner
export const loadPresetOnRemoteDeviceInstance = (device: DeviceStateRecord, preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${device.path}/presets/load`,
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load preset ${preset.name}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};

export const savePresetToRemoteDeviceInstance = (device: DeviceStateRecord, name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${device.path}/presets/save`,
				args: [
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to save preset ${name}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};

export const sendDeviceInstanceMessageToRemote = (device: DeviceStateRecord, inportId: string, value: string): AppThunk =>
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
			address: `/rnbo/inst/${device.index}/messages/in/${inportId}`,
			args: values
		};
		oscQueryBridge.sendPacket(writePacket(message));
	};

export const triggerDeviceInstanceMidiNoteOnEventOnRemote = (device: DeviceStateRecord, note: number): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = 144 + midiChannel;
		const velocityByte = 100;

		const message = {
			address: `${device.path}/midi/in`,
			args: [routeByte, note, velocityByte].map(byte => ({ type: "i", value: byte }))
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const triggerDeviceInstanceMidiNoteOffEventOnRemote = (device: DeviceStateRecord, note: number): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = 128 + midiChannel;
		const velocityByte = 0;

		const message = {
			address: `${device.path}/midi/in`,
			args: [routeByte, note, velocityByte].map(byte => ({ type: "i", value: byte }))
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setDeviceInstanceParameterValueNormalizedOnRemote = throttle((device: DeviceStateRecord, param: ParameterRecord, value: number): AppThunk =>
	(dispatch) => {

		const message = {
			address: `${param.path}/normalized`,
			args: [
				{ type: "f", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));

		// optimistic local state update
		dispatch(setDevice(device.setParameterNormalizedValue(param.id, value)));
	}, 100);


// Updates in response to remote OSCQuery Updates
export const updateDeviceInstancePresetEntries = (index: number, entries: OSCQueryRNBOInstancePresetEntries): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const device = getDeviceByIndex(state, index);
			if (!device) return;

			dispatch(setDevice(device.set("presets", DeviceStateRecord.presetsFromDescription(entries))));
		} catch (e) {
			console.log(e);
		}
	};

export const updateDeviceInstanceMessages = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const device = getDeviceByIndex(state, index);
			if (device) return;

			dispatch(setDevice(
				device
					.set("messageInputs", DeviceStateRecord.messageInputsFromDescription(desc))
					.set("messageOutputs", DeviceStateRecord.messageOutputsFromDescription(desc))
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateDeviceInstanceMessageOutputValue = (index: number, name: string, value: OSCValue | OSCValue[]): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			// Debug enabled?!
			const enabled = getSetting(state, Setting.debugMessageOutput);
			if (!enabled) return;

			// Active Device view?!
			if (Router.asPath !== `/devices/${index}`) return;

			const device = getDeviceByIndex(state, index);
			if (!device) return;

			dispatch(setDevice(
				device.setMessageOutportValue(name, Array.isArray(value) ? value.join(", ") : `${value}`)
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateDeviceInstanceParameters = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["params"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const device = getDeviceByIndex(state, index);
			if (!device) return;

			dispatch(setDevice(
				device.set("parameters", DeviceStateRecord.parametersFromDescription(desc))
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateDeviceInstanceParameterValue = (index: number, id: ParameterRecord["id"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const device = getDeviceByIndex(state, index);
			if (!device) return;

			dispatch(setDevice(device.setParameterValue(id, value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateDeviceInstanceParameterValueNormalized = (index: number, id: ParameterRecord["id"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const device = getDeviceByIndex(state, index);
			if (!device) return;

			dispatch(setDevice(device.setParameterNormalizedValue(id, value)));
		} catch (e) {
			console.log(e);
		}
	};

