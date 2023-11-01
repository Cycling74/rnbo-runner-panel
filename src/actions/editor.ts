import { Connection, Edge, EdgeChange, Node, NodeChange } from "reactflow";
import { ActionBase, AppThunk } from "../lib/store";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { isValidConnection } from "../lib/editorUtils";
import { getConnection, getConnectionByNodesAndPorts, getConnectionsForSinkNodeAndPort, getConnectionsForSourceNodeAndPort, getNode } from "../selectors/graph";
import { GraphConnectionRecord, NodeType } from "../models/graph";
import { EditorNodeRecord } from "../models/editor";
import { setInstanceSourcePortConnections, setInstanceSinkPortConnections, unloadPatcherFromRemoteInstance } from "./device";

export enum EditorActionType {
	POSITION_NODE = "POSITION_NODE",
	SELECT_NODE = "SELECT_NODE",
	UNSELECT_NODE = "UNSELECT_NODE",
	SELECT_EDGE = "SELECT_EDGE",
	UNSELECT_EDGE = "UNSELECT_EDGE"
}

export interface IPositionNode extends ActionBase {
	type: EditorActionType.POSITION_NODE;
	payload: {
		id: EditorNodeRecord["id"];
		x: number;
		y: number;
	};
}

export interface ISelectNode extends ActionBase {
	type: EditorActionType.SELECT_NODE;
	payload: {
		id: EditorNodeRecord["id"];
	};
}

export interface IUnselectNode extends ActionBase {
	type: EditorActionType.UNSELECT_NODE;
	payload: {
		id: EditorNodeRecord["id"];
	};
}

export interface ISelectEgde extends ActionBase {
	type: EditorActionType.SELECT_EDGE;
	payload: {
		id: EditorNodeRecord["id"];
	};
}

export interface IUnselectEdge extends ActionBase {
	type: EditorActionType.UNSELECT_EDGE;
	payload: {
		id: EditorNodeRecord["id"];
	};
}

export type EditorAction = IPositionNode | ISelectNode | IUnselectNode | ISelectEgde | IUnselectEdge;

export const makeEditorConnection = (connection: Connection): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
				throw new Error(`Invalid Connection Description (${connection.source}:${connection.sourceHandle} => ${connection.target}:${connection.targetHandle})`);
			}

			// Valid Connection?
			const { sourceNode, sourcePort, sinkNode, sinkPort } = isValidConnection(connection, state.graph.nodes);

			// Does it already exist?
			const existingConnection = getConnectionByNodesAndPorts(
				state,
				{
					sourceNodeId: sourceNode.id,
					sinkNodeId: sinkNode.id,
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

			if (sourceNode.type === NodeType.System && sinkNode.type === NodeType.System) {
				// TODO: Discuss whether we allow passthrough
			} else if (sourceNode.type === NodeType.Patcher) {
				const connections = getConnectionsForSourceNodeAndPort(state, { sourceNodeId: sourceNode.id, sourcePortId: sourcePort.id }).toArray();
				connections.push(new GraphConnectionRecord({
					sourceNodeId: sourceNode.id,
					sourcePortId: sourcePort.id,
					sinkNodeId: sinkNode.id,
					sinkPortId: sinkPort.id,
					type: sourcePort.type
				}));
				dispatch(setInstanceSourcePortConnections(sourceNode, sourcePort, connections));
			} else if (sinkNode.type === NodeType.Patcher) {
				const connections = getConnectionsForSinkNodeAndPort(state, { sinkNodeId: sinkNode.id, sinkPortId: sinkPort.id }).toArray();
				connections.push(new GraphConnectionRecord({
					sourceNodeId: sourceNode.id,
					sourcePortId: sourcePort.id,
					sinkNodeId: sinkNode.id,
					sinkPortId: sinkPort.id,
					type: sourcePort.type
				}));
				dispatch(setInstanceSinkPortConnections(sinkNode, sinkPort, connections));
			}
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
			if (!connection) {
				throw new Error(`Connection with id ${id} does not exist.`);
			}

			const sourceNode = getNode(state, connection.sourceNodeId);
			if (!sourceNode) {
				throw new Error(`Node with id ${connection.sourceNodeId} does not exist.`);
			}

			const sinkNode = getNode(state, connection.sinkNodeId);
			if (!sinkNode) {
				throw new Error(`Node with id ${connection.sinkNodeId} does not exist.`);
			}

			if (sourceNode.type === NodeType.System && sinkNode.type === NodeType.System) {
				// TODO: Discuss whether we allow passthrough
			} else if (sourceNode.type === NodeType.Patcher) {
				const sourcePort = sourceNode.getPort(connection.sourcePortId);
				if (!sourcePort) {
					throw new Error(`Port with id ${connection.sourcePortId} does not exist on node ${sourceNode.id}.`);
				}
				const connections = getConnectionsForSourceNodeAndPort(state, { sourceNodeId: sourceNode.id, sourcePortId: sourcePort.id });
				dispatch(setInstanceSourcePortConnections(
					sourceNode,
					sourcePort,
					connections.filter(conn => conn !== connection).toArray()
				));
			} else if (sinkNode.type === NodeType.Patcher) {
				// Handle System Input connections by adjusting the connections on the sink node
				const sinkPort = sinkNode.getPort(connection.sinkPortId);
				if (!sinkPort) {
					throw new Error(`Port with id ${connection.sinkPortId} does not exist on node ${sinkNode.id}.`);
				}
				const connections = getConnectionsForSinkNodeAndPort(state, { sinkNodeId: sinkNode.id, sinkPortId: sinkPort.id });
				dispatch(setInstanceSinkPortConnections(
					sinkNode,
					sinkPort,
					connections.filter(conn => conn !== connection).toArray()
				));
			}

		} catch (err) {
			dispatch(showNotification({
				title: "Failed to delete connection",
				level: NotificationLevel.error,
				message: err.message
			}));
			console.error(err);
		}
	};

export const removeEditorNodeById = (id: EditorNodeRecord["id"]): AppThunk =>
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

			dispatch(unloadPatcherFromRemoteInstance(node));

		} catch (err) {
			dispatch(showNotification({
				title: "Failed to node",
				level: NotificationLevel.error,
				message: err.message
			}));
			console.error(err);
		}
	};

export const removeEditorNodes = (nodes: Pick<Node, "id">[]): AppThunk =>
	(dispatch) => {
		for (const node of nodes) {
			dispatch(removeEditorNodeById(node.id));
		}
	};

export const removeEditorEdges = (edges: Pick<Edge, "id">[]): AppThunk =>
	(dispatch) => {
		for (const edge of edges) {
			dispatch(removeEditorConnectionById(edge.id));
		}
	};

export const changeNodePosition = (id: EditorNodeRecord["id"], x: number, y: number): IPositionNode => ({
	type: EditorActionType.POSITION_NODE,
	payload: {
		id,
		x,
		y
	}
});

export const changeNodeSelection = (id: EditorNodeRecord["id"], selected: boolean): ISelectNode | IUnselectNode => ({
	type: selected ? EditorActionType.SELECT_NODE : EditorActionType.UNSELECT_NODE,
	payload: {
		id
	}
});

export const changeEdgeSelection = (id: EditorNodeRecord["id"], selected: boolean): ISelectEgde | IUnselectEdge => ({
	type: selected ? EditorActionType.SELECT_EDGE : EditorActionType.UNSELECT_EDGE,
	payload: {
		id
	}
});

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
