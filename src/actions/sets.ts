import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { GraphSetRecord } from "../models/set";
import { getShowGraphSetsDrawer } from "../selectors/sets";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";

export enum GraphSetActionType {
	INIT = "INIT_SETS",
	SET_SHOW_GRAPH_SETS = "SET_SHOW_GRAPH_SET"
}

export interface IInitGraphSets extends ActionBase {
	type: GraphSetActionType.INIT;
	payload: {
		sets: GraphSetRecord[]
	}
}

export interface IShowGraphSets extends ActionBase {
	type: GraphSetActionType.SET_SHOW_GRAPH_SETS;
	payload: {
		show: boolean;
	};
}

export type GraphSetAction = IInitGraphSets | IShowGraphSets;

export const initSets = (names: string[]): GraphSetAction => {

	return {
		type: GraphSetActionType.INIT,
		payload: {
			sets: names.map(n => GraphSetRecord.fromDescription(n))
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
