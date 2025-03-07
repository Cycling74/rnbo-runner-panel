import { Connection, EdgeChange, NodeChange, ReactFlowInstance } from "reactflow";
import { ActionBase, AppThunk } from "../lib/store";
import { getConnection, getConnectionByPorts, getConnections, getEditorNodesAndPorts, getNode, getNodePosition, getNodes, getPort, getPorts } from "../selectors/graph";
import { GraphConnectionRecord, GraphNode, GraphNodeRecord, NodeType } from "../models/graph";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { calculateLayout, isValidConnection } from "../lib/editorUtils";
import { setConnection, setNode, setNodePosition, setNodePositions, unloadPatcherNodeOnRemote } from "./graph";
import { getGraphEditorInstance, getGraphEditorLockedState } from "../selectors/editor";
import { triggerSetMetaUpdateOnRemote, updateSetMetaOnRemoteFromNodes } from "./meta";

export enum EditorActionType {
	INIT = "EDITOR_INIT",
	UNMOUNT = "EDITOR_UNMOUNT",
	SET_LOCKED = "EDITOR_SET_LOCKED"
}

export interface IInitEditor extends ActionBase {
	type: EditorActionType.INIT;
	payload: {
		instance: ReactFlowInstance;
	};
}

export interface IUnmountEditor extends ActionBase {
	type: EditorActionType.UNMOUNT;
	payload: Record<string, never>;
}

export interface ISetEditorLocked extends ActionBase {
	type: EditorActionType.SET_LOCKED;
	payload: {
		locked: boolean;
	};
}

export type EditorAction = IInitEditor | IUnmountEditor | ISetEditorLocked;

export const unmountEditor = (): IUnmountEditor => {
	return {
		type: EditorActionType.UNMOUNT,
		payload: {}
	};
};

export const createEditorConnection = (connection: Connection): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
				throw new Error(`Invalid Connection Description (${connection.source}:${connection.sourceHandle} => ${connection.target}:${connection.targetHandle})`);
			}

			// Valid Connection?
			const { sourcePort, sinkPort } = isValidConnection(connection, getPorts(state));

			// Does it already exist?
			const existingConnection = getConnectionByPorts(
				state,
				{
					sourcePortId: sourcePort.id,
					sinkPortId: sinkPort.id
				}
			);

			if (existingConnection) {
				return void dispatch(showNotification({
					title: "Skipped creating connection",
					level: NotificationLevel.warn,
					message: `A connection between ${connection.source}:${connection.sourceHandle} and ${connection.target}:${connection.targetHandle} already exists`
				}));
			}

			const message = {
				address: "/rnbo/jack/connections/connect",
				args: [
					{ type: "s", value: sourcePort.id },
					{ type: "s", value: sinkPort.id }
				]
			};

			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				title: "Failed to create connection",
				level: NotificationLevel.error,
				message: err.message
			}));
			console.error(err);
		}
	};

export const removeEditorConnectionById = (id: GraphConnectionRecord["id"]): AppThunk =>
	(dispatch, getState) => {

		try {
			const state = getState();
			const connection = getConnection(state, id);
			if (!connection) throw new Error(`Connection with id ${id} does not exist.`);

			const sourcePort = getPort(state, connection.sourcePortId);
			if (!sourcePort) throw new Error(`Port with id ${connection.sourcePortId} does not exist.`);

			const sinkPort = getPort(state, connection.sinkPortId);
			if (!sinkPort) throw new Error(`Port with id ${connection.sinkPortId} does not exist.`);

			const message = {
				address: "/rnbo/jack/connections/disconnect",
				args: [
					{ type: "s", value: sourcePort.id },
					{ type: "s", value: sinkPort.id }
				]
			};

			oscQueryBridge.sendPacket(writePacket(message));

		} catch (err) {
			dispatch(showNotification({
				title: "Failed to delete connection",
				level: NotificationLevel.error,
				message: err.message
			}));
			console.error(err);
		}
	};


export const removeEditorNodeById = (id: GraphNode["id"], updateSetMeta = true): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const node = getNode(state, id);

			if (!node) {
				throw new Error(`Node with id ${id} does not exist.`);
			}

			if (node.type === NodeType.System) {
				throw new Error(`System nodes cannot be removed (id: ${id}).`);
			}

			dispatch(unloadPatcherNodeOnRemote(node.instanceId));
			if (updateSetMeta) updateSetMetaOnRemoteFromNodes(getNodes(state).delete(node.id).valueSeq().toArray());

		} catch (err) {
			dispatch(showNotification({
				title: "Failed to node",
				level: NotificationLevel.error,
				message: err.message
			}));
			console.error(err);
		}
	};

export const removeEditorNodesById = (ids: GraphNodeRecord["id"][]): AppThunk =>
	(dispatch, getState) => {
		for (const id of ids) {
			dispatch(removeEditorNodeById(id, false));
		}
		// Only at the end update the meta to ensure all coord data has been removed
		updateSetMetaOnRemoteFromNodes(getNodes(getState()).deleteAll(ids).valueSeq().toArray());
	};

export const removeEditorConnectionsById = (ids: GraphConnectionRecord["id"][]): AppThunk =>
	(dispatch) => {
		for (const id of ids) {
			dispatch(removeEditorConnectionById(id));
		}
	};

export const changeNodePosition = (id: GraphNode["id"], x: number, y: number): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const pos = getNodePosition(state, id);
		if (!pos) return;
		dispatch(setNodePosition(pos.updatePosition(x, y)));
		dispatch(triggerSetMetaUpdateOnRemote());
	};

export const changeNodeSelection = (id: GraphNode["id"], selected: boolean): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const node = getNode(state, id);
		if (!node) return;
		dispatch(setNode(selected ? node.select() : node.unselect()));
	};

export const changeEdgeSelection = (id: GraphConnectionRecord["id"], selected: boolean): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const connection = getConnection(state, id);
		if (!connection) return;
		dispatch(setConnection(selected ? connection.select() : connection.unselect()));
	};

export const applyEditorNodeChanges = (changes: NodeChange[]): AppThunk =>
	(dispatch) => {
		for (const change of changes) {
			switch (change.type) {
				case "position": {
					if (change.position) {
						dispatch(changeNodePosition(
							change.id,
							change.position.x,
							change.position.y
						));
					}
					break;
				}

				case "select": {
					dispatch(changeNodeSelection(change.id, change.selected));
					break;
				}

				case "remove": // handled separetely via dedicated action
				case "add":
				case "reset":
				case "dimensions":
				default:
					// no-op
			}
		}
	};

export const applyEditorEdgeChanges = (changes: EdgeChange[]): AppThunk =>
	(dispatch) => {
		for (const change of changes) {
			switch (change.type) {
				case "select": {
					dispatch(changeEdgeSelection(change.id, change.selected));
					break;
				}

				case "remove": // handled separetely via dedicated action
				case "add":
				case "reset":
				default:
					// no-op
			}
		}
	};

export const setEditorLockedState = (state: boolean): ISetEditorLocked => {
	return {
		type: EditorActionType.SET_LOCKED,
		payload: {
			locked: state
		}
	};
};

export const toggleEditorLockedState = (): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		dispatch(setEditorLockedState(!getGraphEditorLockedState(state)));
	};

export const triggerEditorFitView = (): AppThunk =>
	(_, getState) => {
		const state = getState();
		window.requestAnimationFrame(() => getGraphEditorInstance(state)?.fitView());
	};

export const editorZoomIn = (): AppThunk =>
	(_, getState) => {
		const state = getState();
		getGraphEditorInstance(state)?.zoomIn();
	};

export const editorZoomOut = (): AppThunk =>
	(_, getState) => {
		const state = getState();
		getGraphEditorInstance(state)?.zoomOut();
	};

export const generateEditorLayout = (): AppThunk =>
	(dispatch, getState) => {
		const state = getState();

		const positions = calculateLayout(
			getPorts(state),
			getConnections(state),
			getEditorNodesAndPorts(state)
		);

		dispatch(setNodePositions(positions));
		dispatch(triggerSetMetaUpdateOnRemote());
		dispatch(triggerEditorFitView());
	};


export const initEditor = (instance: ReactFlowInstance): AppThunk =>
	async (dispatch)  => {
		dispatch({ type: EditorActionType.INIT, payload: { instance } });
		window.requestAnimationFrame(() => instance.fitView());
	};
