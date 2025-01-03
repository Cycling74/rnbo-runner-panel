import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { GraphSetRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { updateSetMetaOnRemoteFromNodes } from "./meta";
import { NodeType } from "../models/graph";
import { getNodes } from "../selectors/graph";
import { getInitialGraphSet, getLatestGraphPreset, getLatestGraphSet } from "../selectors/sets";

export enum GraphSetActionType {
	INIT_SETS = "INIT_SETS",
	INIT_SET_PRESETS = "INIT_SET_PRESETS",

	SET_SET_PRESET_LATEST = "SET_SET_PRESET_LATEST",
	SET_SET_LATEST = "SET_PRESET_LATEST",
	SET_SET_INITIAL = "SET_SET_INITIAL"
}

export interface IInitGraphSets extends ActionBase {
	type: GraphSetActionType.INIT_SETS;
	payload: {
		sets: GraphSetRecord[]
	}
}

export interface ISetGraphSetsLatest extends ActionBase {
	type: GraphSetActionType.SET_SET_LATEST;
	payload: {
		name: string
	}
}
export interface ISetGraphSetsInitial extends ActionBase {
	type: GraphSetActionType.SET_SET_INITIAL;
	payload: {
		name: string
	}
}

export interface IInitGraphSetPresets extends ActionBase {
	type: GraphSetActionType.INIT_SET_PRESETS;
	payload: {
		presets: PresetRecord[]
	}
}

export interface ISetGraphSetPresetsLatest extends ActionBase {
	type: GraphSetActionType.SET_SET_PRESET_LATEST;
	payload: {
		name: string
	}
}

export type GraphSetAction = IInitGraphSets | ISetGraphSetsLatest | ISetGraphSetsInitial | IInitGraphSetPresets | ISetGraphSetPresetsLatest;

export const initSets = (names: string[]): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const currentInitial = getInitialGraphSet(state);
		const currentLatest = getLatestGraphSet(state);

		const action: IInitGraphSets = {
			type: GraphSetActionType.INIT_SETS,
			payload: {
				sets: names.map(name => GraphSetRecord.fromDescription(
					name,
					currentInitial?.name === name,
					currentLatest?.name === name
				))
			}
		};
		dispatch(action);
	};

export const setGraphSetLatest = (name: string): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SET_LATEST,
		payload: {
			name
		}
	};
};

export const setGraphSetInitial = (name: string): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SET_INITIAL,
		payload: {
			name
		}
	};
};

export const initSetPresets = (names: string[]): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const currentLatest = getLatestGraphPreset(state);

		const action: IInitGraphSetPresets = {
			type: GraphSetActionType.INIT_SET_PRESETS,
			payload: {
				presets: names.map(name => PresetRecord.fromDescription(
					name,
					false,
					currentLatest?.name === name
				))
			}
		};
		dispatch(action);
	};

export const setGraphSetPresetLatest = (name: string): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SET_PRESET_LATEST,
		payload: {
			name
		}
	};
};

export const clearGraphSetOnRemote = (): AppThunk =>
	(dispatch, getState) => {
		try {
			const message = {
				address: "/rnbo/inst/control/unload",
				args: [
					{ type: "i", value: -1 }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
			const nodes = getNodes(getState());
			dispatch(updateSetMetaOnRemoteFromNodes(nodes.filter(n => n.type !== NodeType.Patcher)));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to clear the set",
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const loadGraphSetOnRemote = (set: GraphSetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/load",
				args: [
					{ type: "s", value: set.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load set ${set.name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const saveGraphSetOnRemote = (name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/save",
				args: [
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to save set ${name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const setInitialGraphSetOnRemote = (set: GraphSetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/initial",
				args: [
					{ type: "s", value: set.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to set initial set to ${set.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const destroyGraphSetOnRemote = (set: GraphSetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/destroy",
				args: [
					{ type: "s", value: set.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete set ${set.name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const renameGraphSetOnRemote = (set: GraphSetRecord, newName: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/rename",
				args: [
					{ type: "s", value: set.name },
					{ type: "s", value: newName }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to rename set ${set.name} -> ${newName}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const loadSetPresetOnRemote = (preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/presets/load",
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

export const saveSetPresetToRemote = (name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/presets/save",
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

export const destroySetPresetOnRemote = (preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/presets/destroy",
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete preset ${preset.name}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};

export const renameSetPresetOnRemote = (preset: PresetRecord, newname: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/presets/rename",
				args: [
					{ type: "s", value: preset.name },
					{ type: "s", value: newname }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to rename preset ${preset.name} to ${newname}`,
				message: "Please check the consolor for further details."
			}));
			console.log(err);
		}
	};
