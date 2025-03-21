import { OSCArgument, writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { GraphSetRecord, GraphSetViewRecord } from "../models/set";
import { PresetRecord } from "../models/preset";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { ParameterRecord } from "../models/parameter";
import { getPatcherInstance, getPatcherInstanceParametersSortedByInstanceIdAndIndex } from "../selectors/patchers";
import { OSCQueryRNBOSetView, OSCQueryRNBOSetViewState } from "../lib/types";
import { getCurrentGraphSet, getCurrentGraphSetId, getCurrentGraphSetIsDirty, getGraphPresets, getGraphSets, getGraphSetView, getGraphSetViews } from "../selectors/sets";
import { clamp, getUniqueName, instanceAndParamIndicesToSetViewEntry, sleep, validateGraphSetName, validatePresetName, validateSetViewName } from "../lib/util";
import { setInstanceWaitingForMidiMappingOnRemote } from "./patchers";
import { DialogResult, showConfirmDialog, showTextInputDialog } from "../lib/dialogs";
import { UnsavedSetName } from "../lib/constants";

export enum GraphSetActionType {
	INIT_SETS = "INIT_SETS",
	SET_SET_CURRENT = "SET_SET_CURRENT",
	SET_SET_CURRENT_DIRTY = "SET_SET_CURRENT_DIRTY",

	INIT_SET_PRESETS = "INIT_SET_PRESETS",
	SET_SET_PRESET_LATEST = "SET_SET_PRESET_LATEST",

	INIT_SET_VIEWS = "INIT_SET_VIEWS",
	SET_SET_VIEW = "SET_SET_VIEW",
	LOAD_SET_VIEW = "LOAD_SET_VIEW",
	DELETE_SET_VIEW = "DELETE_SET_VIEW",
	SET_SET_VIEW_ORDER = "SET_SET_VIEW_ORDER"
}

export interface IInitGraphSets extends ActionBase {
	type: GraphSetActionType.INIT_SETS;
	payload: {
		sets: GraphSetRecord[]
	}
}

export interface ISetGraphSetCurrent extends ActionBase {
	type: GraphSetActionType.SET_SET_CURRENT;
	payload: {
		name: string;
	}
}

export interface ISetGraphSetCurrentDirty extends ActionBase {
	type: GraphSetActionType.SET_SET_CURRENT_DIRTY;
	payload: {
		dirty: boolean;
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
		order: Array<GraphSetViewRecord["id"]>;
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

export interface ISetGraphSetViewOrder extends ActionBase {
	type: GraphSetActionType.SET_SET_VIEW_ORDER;
	payload: {
		order: Array<GraphSetViewRecord["id"]>;
	};
}


export type GraphSetAction = IInitGraphSets | ISetGraphSetCurrent | ISetGraphSetCurrentDirty | IInitGraphSetPresets | ISetGraphSetPresetsLatest |
IInitGraphSetViews | ILoadGraphSetView | ISetGraphSetView | IDeleteGraphSetView | ISetGraphSetViewOrder;

export const initSets = (names: string[]): GraphSetAction => {
	return {
		type: GraphSetActionType.INIT_SETS,
		payload: {
			sets: names.map(n => GraphSetRecord.fromDescription(n))
		}
	};
};

export const setCurrentGraphSet = (name: string): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SET_CURRENT,
		payload: {
			name
		}
	};
};

export const setCurrentGraphSetDirtyState = (dirty: boolean): GraphSetAction => {
	return {
		type: GraphSetActionType.SET_SET_CURRENT_DIRTY,
		payload: {
			dirty
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

export const saveGraphSetOnRemote = (givenName: string, ensureUniqueName: boolean = true): AppThunk =>
	(dispatch, getState) => {
		try {
			const graphSets = getGraphSets(getState());
			const name = ensureUniqueName
				? getUniqueName(givenName, graphSets.valueSeq().map(s => s.name).toArray())
				: givenName;

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
				title: `Error while trying to save set ${givenName}`,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};


export const saveCurrentGraphSetOnRemote = (): AppThunk =>
	async (dispatch, getState) => {

		try {
			// id == name
			const id = getCurrentGraphSetId(getState());
			if (!id) return;

			const name = id !== UnsavedSetName
				? id
				: (
					await showTextInputDialog({
						text: "Please name the graph",
						actions: {
							confirm: { label: "Save Graph" }
						},
						validate: validateGraphSetName
					}));

			if (name === DialogResult.Cancel) {
				return;
			}
			dispatch(saveGraphSetOnRemote(name, false));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to save graph",
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};


export const overwriteGraphSetOnRemote = (set: GraphSetRecord): AppThunk =>
	async (dispatch) => {
		try {
			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to overwrite the graph named ${set.name} with the currently loaded graph?`,
				actions: {
					confirm: { label: "Overwrite Graph" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			dispatch(saveGraphSetOnRemote(set.name, false));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to overwrite set ${set.name}`,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};

export const saveCurrentGraphSetOnRemoteAs = (): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showTextInputDialog({
				text: "Please name the graph",
				actions: {
					confirm: { label: "Save Graph" }
				},
				validate: (v: string) => {
					const value = v.trim();
					if (!value?.length) return "Please provide a valid, non empty name.";
					return true;
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			dispatch(saveGraphSetOnRemote(dialogResult, true));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to save graph",
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};

export const loadGraphSetOnRemote = (set: GraphSetRecord): AppThunk =>
	async (dispatch, getState) => {
		try {
			const state = getState();
			const currentSet = getCurrentGraphSet(state);

			// Set already loaded?
			if (currentSet?.id === set.id) return;

			// Pending Changes?
			if (currentSet && getCurrentGraphSetIsDirty(state)) {
				const dialogResult = await showConfirmDialog({
					text: `Save changes to ${currentSet.name} before loading ${set.name}?`,
					actions: {
						discard: { label: "Discard Changes" },
						confirm: { label: "Save Changes" }
					}
				});

				if (dialogResult === DialogResult.Cancel) {
					// User Canceled, do nothing
					return;
				} else if (dialogResult === DialogResult.Confirm) {
					// Save before proceeding
					dispatch(saveGraphSetOnRemote(currentSet.name, false));
					await sleep(30);
				}
			}

			const message = {
				address: "/rnbo/inst/control/sets/load",
				args: [ { type: "s", value: set.name } ]
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

export const loadNewEmptyGraphSetOnRemote = (): AppThunk =>
	async (dispatch, getState) => {
		try {

			const state = getState();
			const currentSet = getCurrentGraphSet(state);

			// Pending Changes?
			if (currentSet && getCurrentGraphSetIsDirty(state)) {
				const dialogResult = await showConfirmDialog({
					text: `Save changes to ${currentSet.name} before loading a new empty graph?`,
					actions: {
						discard: { label: "Discard Changes" },
						confirm: { label: "Save Changes" }
					}
				});

				if (dialogResult === DialogResult.Cancel) {
					// User Canceled, do nothing
					return;
				} else if (dialogResult === DialogResult.Confirm) {
					// Save before proceeding
					dispatch(saveGraphSetOnRemote(currentSet.name, false));
					await sleep(30);
				}
			}

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
				title: "Error while trying to load a new empty set",
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};

export const destroyGraphSetOnRemote = (set: GraphSetRecord): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to delete the graph named ${set.name}?`,
				actions: {
					confirm: { label: "Delete", color: "red" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

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

export const saveSetPresetToRemote = (givenName: string, ensureUniqueName: boolean = true): AppThunk =>
	(dispatch, getState) => {
		try {

			const setPresets = getGraphPresets(getState());
			const name = ensureUniqueName
				? getUniqueName(givenName, setPresets.valueSeq().map(p => p.name).toArray())
				: givenName;

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
				title: `Error while trying to save preset ${givenName}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};


export const createSetPresetOnRemote = (): AppThunk =>
	async (dispatch) => {
		try {
			const dialogResult = await showTextInputDialog({
				text: "Please name the new graph preset",
				actions: {
					confirm: { label: "Create Preset" }
				},
				validate: validatePresetName
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			dispatch(saveSetPresetToRemote(dialogResult, true));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to create graph preset",
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const overwriteSetPresetOnRemote = (preset: PresetRecord): AppThunk =>
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
			dispatch(saveSetPresetToRemote(preset.name, false));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to overwrite preset ${preset.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const destroySetPresetOnRemote = (preset: PresetRecord): AppThunk =>
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

export const initSetViews = (viewState?: OSCQueryRNBOSetViewState): IInitGraphSetViews => {

	const views: GraphSetViewRecord[] = [];
	for (const [id, view] of Object.entries(viewState?.CONTENTS?.list?.CONTENTS || {}) as Array<[string, OSCQueryRNBOSetView]>) {
		views.push(
			GraphSetViewRecord.fromDescription(id, view)
		);
	}

	const order: number[] = viewState?.CONTENTS?.order?.VALUE  || views.map(v => v.id);

	return {
		type: GraphSetActionType.INIT_SET_VIEWS,
		payload: {
			views,
			order
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

export const createSetViewOnRemote = (): AppThunk =>
	async (dispatch, getState) => {
		try {

			const dialogResult = await showTextInputDialog({
				text: "Please name the new parameter view",
				actions: {
					confirm: { label: "Create Parameter View" }
				},
				validate: validateSetViewName
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			const state = getState();
			const params = getPatcherInstanceParametersSortedByInstanceIdAndIndex(state);
			const existingViews = getGraphSetViews(state);
			const name = getUniqueName(dialogResult, existingViews.valueSeq().map(v => v.name).toArray());

			const message = {
				address: "/rnbo/inst/control/sets/views/create",
				args: [
					{ type: "s", value: name },
					...params.map(p => ({ type: "s", value: p.setViewId })).toArray()
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
	async (dispatch) => {
		try {

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to delete the view named ${setView.name}?`,
				actions: {
					confirm: { label: "Delete", color: "red" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

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

export const deleteSetView = (id: number): AppThunk =>
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
			const currentIndex = setView.params.findIndex(entry => entry.instanceId === param.instanceId && entry.paramIndex === param.index);
			const newIndex = clamp(currentIndex + offset, 0, setView.params.size - 1);

			const newList = setView.params
				.delete(currentIndex)
				.insert(newIndex, { instanceId: param.instanceId, paramIndex: param.index });
			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/params`,
				args: newList.toArray().map(p => ({ type: "s", value: instanceAndParamIndicesToSetViewEntry(p.instanceId, p.paramIndex) }))
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

export const removeAllParametersFromSetView = (setView: GraphSetViewRecord): AppThunk =>
	async (dispatch) => {
		try {

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to remove all parameters from ${setView.name}? This action cannot be undone.`,
				actions: {
					confirm: { label: "Remove Parameters", color: "red" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

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
			params.push({ type: "s", value: instanceAndParamIndicesToSetViewEntry(param.instanceId, param.index) });

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

export const addAllParametersToSetView = (setView: GraphSetViewRecord): AppThunk =>
	async (dispatch, getState) => {
		try {
			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to append all missing parameters from all devices to ${setView.name}? This action cannot be undone.`,
				actions: {
					confirm: { label: "Add Parameters" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			const state = getState();
			const params = setView.params.withMutations(list => {
				getPatcherInstanceParametersSortedByInstanceIdAndIndex(state)
					.forEach(param => {
						if (!setView.paramIds.has(param.setViewId)) {
							list.push({ instanceId: param.instanceId, paramIndex: param.index });
						}
					});
			}).toArray();

			const message = {
				address: `/rnbo/inst/control/sets/views/list/${setView.id}/params`,
				args: params.map(p => ({ type: "s", value: instanceAndParamIndicesToSetViewEntry(p.instanceId, p.paramIndex) }))
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

export const setViewContainedInstancesWaitingForMidiMappingOnRemote = (setView: GraphSetViewRecord, value: boolean): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const ids = setView.instanceIds.toArray();

		for (const instanceId of ids) {
			const instance = getPatcherInstance(state, instanceId);
			if (!instance) continue;
			dispatch(setInstanceWaitingForMidiMappingOnRemote(instance.id, value));
		}
	};

export const updateSetViewOrder = (order: OSCQueryRNBOSetViewState["CONTENTS"]["order"]["VALUE"]): ISetGraphSetViewOrder => {
	return {
		type: GraphSetActionType.SET_SET_VIEW_ORDER,
		payload: {
			order
		}
	};
};
