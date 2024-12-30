import { OSCArgument, writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { GraphSetRecord, GraphSetViewRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { updateSetMetaOnRemoteFromNodes } from "./meta";
import { NodeType } from "../models/graph";
import { getNodes } from "../selectors/graph";
import { ParameterRecord } from "../models/parameter";
import { getPatcherInstanceParameters } from "../selectors/patchers";
import { OSCQueryRNBOSetView, OSCQueryRNBOSetViewListState } from "../lib/types";
import { getGraphSetView } from "../selectors/sets";
import { clamp, instanceAndParamIndicesToSetViewEntry } from "../lib/util";

export enum GraphSetActionType {
	INIT_SETS = "INIT_SETS",
	SET_SET_LATEST = "SET_PRESET_LATEST",

	INIT_SET_PRESETS = "INIT_SET_PRESETS",
	SET_SET_PRESET_LATEST = "SET_SET_PRESET_LATEST",

	INIT_SET_VIEWS = "INIT_SET_VIEWS",
	SET_SET_VIEW = "SET_SET_VIEW",
	LOAD_SET_VIEW = "LOAD_SET_VIEW",
	DELETE_SET_VIEW = "DELETE_SET_VIEW"
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

export interface IInitGraphSetViews extends ActionBase {
	type: GraphSetActionType.INIT_SET_VIEWS;
	payload: {
		views: GraphSetViewRecord[];
	};
}

export interface ILoadGraphSetView extends ActionBase {
	type: GraphSetActionType.LOAD_SET_VIEW;
	payload: {
		view: GraphSetViewRecord;
	};
}

export interface ISetGraphSetView extends ActionBase {
	type: GraphSetActionType.SET_SET_VIEW;
	payload: {
		view: GraphSetViewRecord;
	};
}

export interface IDeleteGraphSetView extends ActionBase {
	type: GraphSetActionType.DELETE_SET_VIEW;
	payload: {
		view: GraphSetViewRecord;
	};
}


export type GraphSetAction = IInitGraphSets | ISetGraphSetsLatest | IInitGraphSetPresets | ISetGraphSetPresetsLatest |
IInitGraphSetViews | ILoadGraphSetView | ISetGraphSetView | IDeleteGraphSetView;

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
				message: "Please check the console for further details."
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
				message: "Please check the console for further details."
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
				message: "Please check the console for further details."
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
				message: "Please check the console for further details."
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
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};

export const initSetPresets = (names: string[]): GraphSetAction => {
	return {
		type: GraphSetActionType.INIT_SET_PRESETS,
		payload: {
			presets: names.map(n => PresetRecord.fromDescription(n, n === "initial"))
		}
	};
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
				message: "Please check the console for further details."
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
				message: "Please check the console for further details."
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
				message: "Please check the console for further details."
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
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const initSetViews = (viewState?: OSCQueryRNBOSetViewListState): IInitGraphSetViews => {

	const views: GraphSetViewRecord[] = [];
	for (const [id, view] of Object.entries(viewState?.CONTENTS || {}) as Array<[string, OSCQueryRNBOSetView]>) {
		views.push(
			GraphSetViewRecord.fromDescription(id, view)
		);
	}

	return {
		type: GraphSetActionType.INIT_SET_VIEWS,
		payload: {
			views
		}
	};
};

export const setSetView = (view: GraphSetViewRecord): ISetGraphSetView => {
	return {
		type: GraphSetActionType.SET_SET_VIEW,
		payload: {
			view
		}
	};
};

export const createSetViewOnRemote = (name: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const params = getPatcherInstanceParameters(state);
			// TODO: ensure name is unique

			const message = {
				address: "/rnbo/inst/control/sets/views/create",
				args: [
					{ type: "s", value: name },
					...params.valueSeq().map(p => ({ type: "s", value: p.setViewId })).toArray()
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to create a new SetView",
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const addSetView = (id: string): ISetGraphSetView => {
	return {
		type: GraphSetActionType.SET_SET_VIEW,
		payload: {
			view: GraphSetViewRecord.getEmptyRecord(id)
		}
	};
};

export const loadSetView = (setView: GraphSetViewRecord): ILoadGraphSetView => {
	return {
		type: GraphSetActionType.LOAD_SET_VIEW,
		payload: {
			view: setView
		}
	};
};

export const renameSetViewOnRemote = (setView: GraphSetViewRecord, newname: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/name`,
				args: [
					{ type: "s", value: newname }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to rename SetView "${setView.name}" to "${newname}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const updateSetViewName = (id: GraphSetViewRecord["id"], newname: string): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const setView = getGraphSetView(state, id);
		if (!setView) return;

		dispatch(setSetView(setView.setName(newname)));
	};

export const destroySetViewOnRemote = (setView: GraphSetViewRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/views/destroy",
				args: [{ type: "i", value: setView.id }]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to destroy SetView "${setView.name}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const deleteSetView = (id: string): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const setView = getGraphSetView(state, id);
		if (!setView) return;

		const action: IDeleteGraphSetView = {
			type: GraphSetActionType.DELETE_SET_VIEW,
			payload: { view: setView }
		};
		dispatch(action);
	};

export const destroyAllSetViewsOnRemote = (): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/views/destroy",
				args: [{ type: "i", value: -1 }]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to destroy all SetViews",
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const updateSetViewParameterListOnRemote = (setView: GraphSetViewRecord, params: ParameterRecord[]): AppThunk =>
	(dispatch) => {

		try {
			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/params`,
				args: params.map(p => ({ type: "s", value: p.setViewId }))
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to update parameter list of SetView "${setView.name}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const offsetParameterIndexInSetView = (setView: GraphSetViewRecord, param: ParameterRecord, offset: number): AppThunk =>
	(dispatch) => {
		try {
			const currentIndex = setView.params.findIndex(entry => entry.instanceIndex === param.instanceIndex && entry.paramIndex === param.index);
			const newIndex = clamp(currentIndex + offset, 0, setView.params.size - 1);

			const newList = setView.params
				.delete(currentIndex)
				.insert(newIndex, { instanceIndex: param.instanceIndex, paramIndex: param.index });
			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/params`,
				args: newList.toArray().map(p => ({ type: "s", value: instanceAndParamIndicesToSetViewEntry(p.instanceIndex, p.paramIndex) }))
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to update parameter list of SetView "${setView.name}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const decreaseParameterIndexInSetView = (setView: GraphSetViewRecord, param: ParameterRecord) => offsetParameterIndexInSetView(
	setView,
	param,
	-1
);

export const increaseParameterIndexInSetView = (setView: GraphSetViewRecord, param: ParameterRecord): AppThunk => offsetParameterIndexInSetView(
	setView,
	param,
	1
);

export const removeParameterFromSetView = (setView: GraphSetViewRecord, param: ParameterRecord): AppThunk =>
	(dispatch) => {
		try {
			if (!setView.paramIds.has(param.setViewId)) return;
			const params = setView.paramIds.remove(param.setViewId).toArray().map(pId => ({ type: "s", value: pId }));

			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/params`,
				args: params
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to update parameter list of SetView "${setView.name}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const removeAllParamtersFromSetView = (setView: GraphSetViewRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/params`,
				args: [] as OSCArgument[]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to update parameter list of SetView "${setView.name}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const addParameterToSetView = (setView: GraphSetViewRecord, param: ParameterRecord): AppThunk =>
	(dispatch) => {
		try {
			if (setView.paramIds.has(param.setViewId)) return;
			const params = setView.paramIds.toArray().map(pId => ({ type: "s", value: pId }));
			params.push({ type: "s", value: instanceAndParamIndicesToSetViewEntry(param.instanceIndex, param.index) });

			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/params`,
				args: params
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to update parameter list of SetView "${setView.name}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const addAllParamtersToSetView = (setView: GraphSetViewRecord): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const params = setView.params.withMutations(list => {
				getPatcherInstanceParameters(state)
					.valueSeq()
					.sort((a, b) => {
						if (a.instanceIndex < b.instanceIndex) return -1;
						if (a.instanceIndex > b.instanceIndex) return 1;
						if (a.index < b.index) return -1;
						if (a.index > b.index) return 1;
						return 0;
					})
					.forEach(param => {
						if (!setView.paramIds.has(param.setViewId)) {
							list.push({ instanceIndex: param.instanceIndex, paramIndex: param.index });
						}
					});
			}).toArray();


			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/params`,
				args: params.map(p => ({ type: "s", value: instanceAndParamIndicesToSetViewEntry(p.instanceIndex, p.paramIndex) }))
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to update parameter list of SetView "${setView.name}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const updateSetViewParameterList = (id: GraphSetViewRecord["id"], params: string[]): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const setView = getGraphSetView(state, id);
		if (!setView) return;

		dispatch(setSetView(setView.setParams(params)));
	};

export const updateSetViewSortOrderOnRemote = (setView: GraphSetViewRecord, sortOrder: number): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/sort_order`,
				args: [
					{ type: "i", value: sortOrder }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to update sort order for SetView "${setView.name}"`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const updateSetViewSortOrder = (id: GraphSetViewRecord["id"], sortOrder: number): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const setView = getGraphSetView(state, id);
		if (!setView) return;

		dispatch(setSetView(setView.setSortOrder(sortOrder)));
	};
