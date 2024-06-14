import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { GraphSetRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { getShowGraphSetsDrawer } from "../selectors/sets";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";

export enum GraphSetActionType {
	INIT_SETS = "INIT_SETS",
	SET_SET_PRESET_LATEST = "SET_SET_PRESET_LATEST",
	INIT_SET_PRESETS = "INIT_SET_PRESETS",
	SET_SET_LATEST = "SET_PRESET_LATEST",
	SET_SHOW_GRAPH_SETS = "SET_SHOW_GRAPH_SET"
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

export interface IShowGraphSets extends ActionBase {
	type: GraphSetActionType.SET_SHOW_GRAPH_SETS;
	payload: {
		show: boolean;
	};
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

export type GraphSetAction = IInitGraphSets | ISetGraphSetsLatest | IShowGraphSets | IInitGraphSetPresets | ISetGraphSetPresetsLatest;

export const initSets = (names: string[]): GraphSetAction => {
	return {
		type: GraphSetActionType.INIT_SETS,
		payload: {
			sets: names.map(n => GraphSetRecord.fromDescription(n))
		}
	};
};

export const setGraphSetLatest = (name: string): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SET_LATEST,
		payload: {
			name
		}
	};
};

export const initSetPresets = (names: string[]): GraphSetAction => {
	return {
		type: GraphSetActionType.INIT_SET_PRESETS,
		payload: {
			presets: names.map(n => PresetRecord.fromDescription(n, n === "initial"))
		}
	};
};

export const setGraphSetPresetLatest = (name: string): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SET_PRESET_LATEST,
		payload: {
			name
		}
	};
};

export const showGraphSets = (): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SHOW_GRAPH_SETS,
		payload: {
			show: true
		}
	};
};

export const hideGraphSets = (): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SHOW_GRAPH_SETS,
		payload: {
			show: false
		}
	};
};

export const toggleShowGraphSets = () : AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const isShown = getShowGraphSetsDrawer(state);
		dispatch({ type: GraphSetActionType.SET_SHOW_GRAPH_SETS, payload: { show: !isShown } });
	};

export const clearGraphSetOnRemote = (): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/unload",
				args: [
					{ type: "i", value: -1 }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
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
