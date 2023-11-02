import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancesState, OSCQueryRNBOJackPortInfo } from "../lib/types";
import { ConnectionType, GraphConnectionRecord, GraphNode, GraphNodeRecord, GraphPatcherNode, GraphPatcherNodeRecord, GraphPortRecord, GraphSystemNodeRecord, NodeType } from "../models/graph";
import { getConnection, getConnectionByNodesAndPorts, getConnectionsForSinkNodeAndPort, getConnectionsForSourceNodeAndPort, getNode, getNodeByIndex, getNodes } from "../selectors/graph";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { DeviceStateRecord } from "../models/device";
import { deleteDevice, setDevice, setDevices } from "./instances";
import { getDevice } from "../selectors/instances";
import { PatcherRecord } from "../models/patcher";
import { Connection, EdgeChange, NodeChange } from "reactflow";
import { isValidConnection } from "../lib/editorUtils";

const defaultNodeSpacing = 100;
const getNodeCoordinates = (node: GraphNodeRecord, nodes: GraphNodeRecord[]): { x: number, y: number } => {

	if (node.type === NodeType.System) {
		return {
			x: (node.id === GraphSystemNodeRecord.systemInputName ? -1 : 1) * (node.width + defaultNodeSpacing * 3),
			y: 0
		};
	}

	const bottomNode: GraphNodeRecord | undefined = nodes.reduce((n, current) => {
		if (current.type === NodeType.System) return n;
		if (!n && current.type === NodeType.Patcher) return current;
		return current.y > n.y ? current : n;
	}, undefined as GraphNodeRecord | undefined);

	const y = bottomNode ? bottomNode.y + bottomNode.height + defaultNodeSpacing : 0;
	return { x: 0, y };
};

export enum GraphActionType {
	DELETE_NODE = "DELETE_NODE",
	DELETE_NODES = "DELETE_NODES",
	SET_NODE = "SET_NODE",
	SET_NODES = "SET_NODES",
	DELETE_CONNECTION = "DELETE_CONNECTION",
	DELETE_CONNECTIONS = "DELETE_CONNECTIONS",
	SET_CONNECTION = "SET_CONNECTION",
	SET_CONNECTIONS = "SET_CONNECTIONS",
	INIT = "INIT_GRAPH"
}

export interface ISetGraphNode extends ActionBase {
	type: GraphActionType.SET_NODE;
	payload: {
		node: GraphNodeRecord;
	};
}

export interface ISetGraphNodes extends ActionBase {
	type: GraphActionType.SET_NODES;
	payload: {
		nodes: GraphNodeRecord[];
	};
}

export interface IDeleteGraphNode extends ActionBase {
	type: GraphActionType.DELETE_NODE;
	payload: {
		node: GraphNodeRecord;
	};
}

export interface IDeleteGraphNodes extends ActionBase {
	type: GraphActionType.DELETE_NODES;
	payload: {
		nodes: GraphNodeRecord[];
	};
}

export interface ISetGraphConnection extends ActionBase {
	type: GraphActionType.SET_CONNECTION;
	payload: {
		connection: GraphConnectionRecord;
	};
}

export interface ISetGraphConnections extends ActionBase {
	type: GraphActionType.SET_CONNECTIONS;
	payload: {
		connections: GraphConnectionRecord[];
	};
}

export interface IDeleteGraphConnection extends ActionBase {
	type: GraphActionType.DELETE_CONNECTION;
	payload: {
		connection: GraphConnectionRecord;
	};
}

export interface IDeleteGraphConnections extends ActionBase {
	type: GraphActionType.DELETE_CONNECTIONS;
	payload: {
		connections: GraphConnectionRecord[];
	};
}

export interface IInitGraph extends ActionBase {
	type: GraphActionType.INIT;
	payload: {
		connections: GraphConnectionRecord[],
		nodes: GraphNodeRecord[]
	}
}

export type GraphAction = IInitGraph | ISetGraphNode | ISetGraphNodes | IDeleteGraphNode | IDeleteGraphNodes
| ISetGraphConnection  | IDeleteGraphConnection | ISetGraphConnections  | IDeleteGraphConnections;


export const initGraph = (jackPortsInfo: OSCQueryRNBOJackPortInfo, instanceInfo: OSCQueryRNBOInstancesState): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const existingNodes = getNodes(state);

		const devices: DeviceStateRecord[] = [];
		const patcherNodes: GraphPatcherNodeRecord[] = [];
		const connections: GraphConnectionRecord[] = [];

		const systemNodes: GraphSystemNodeRecord[] = GraphSystemNodeRecord.fromDescription(jackPortsInfo).map(sysNode => {
			const exNode = existingNodes.get(sysNode.id);
			if (exNode) return sysNode.updatePosition(exNode.x, exNode.y);

			const { x, y } = getNodeCoordinates(sysNode, []);
			return sysNode.updatePosition(x, y);
		});

		for (const [key, value] of Object.entries(instanceInfo.CONTENTS)) {
			if (!/^\d+$/.test(key)) continue;

			let node = GraphPatcherNodeRecord.fromDescription(value);
			const exNode = existingNodes.get(node.id);
			if (exNode) {
				node = node.updatePosition(exNode.x, exNode.y);
			} else {
				const { x, y } = getNodeCoordinates(node, patcherNodes);
				node = node.updatePosition(x, y);
			}

			connections.push(...GraphConnectionRecord.patcherNodeConnectionsFromDescription(node.id, value.CONTENTS.jack.CONTENTS.connections));
			patcherNodes.push(node);
			devices.push(DeviceStateRecord.fromDescription(value));
		}

		const initAction: IInitGraph = {
			type: GraphActionType.INIT,
			payload: {
				connections,
				nodes: [...systemNodes, ...patcherNodes]
			}
		};

		dispatch(initAction);
		dispatch(setDevices(devices));
	};

export const setNode = (node: GraphNodeRecord): GraphAction => {
	return {
		type: GraphActionType.SET_NODE,
		payload: {
			node
		}
	};
};

export const setNodes = (nodes: GraphNodeRecord[]): GraphAction => {
	return {
		type: GraphActionType.SET_NODES,
		payload: {
			nodes
		}
	};
};

export const deleteNode = (node: GraphNodeRecord): GraphAction => {
	return {
		type: GraphActionType.DELETE_NODE,
		payload: {
			node
		}
	};
};

export const deleteNodes = (nodes: GraphNodeRecord[]): GraphAction => {
	return {
		type: GraphActionType.DELETE_NODES,
		payload: {
			nodes
		}
	};
};


export const setConnection = (connection: GraphConnectionRecord): GraphAction => {
	return {
		type: GraphActionType.SET_CONNECTION,
		payload: {
			connection
		}
	};
};

export const setConnections = (connections: GraphConnectionRecord[]): GraphAction => {
	return {
		type: GraphActionType.SET_CONNECTIONS,
		payload: {
			connections
		}
	};
};

export const deleteConnection = (connection: GraphConnectionRecord): GraphAction => {
	return {
		type: GraphActionType.DELETE_CONNECTION,
		payload: {
			connection
		}
	};
};

export const deleteConnections = (connections: GraphConnectionRecord[]): GraphAction => {
	return {
		type: GraphActionType.DELETE_CONNECTIONS,
		payload: {
			connections
		}
	};
};

// Trigger Updates on remote OSCQuery Runner
export const unloadPatcherNodeByIndexOnRemote = (deviceIndex: number): AppThunk =>
	(dispatch) => {
		try {

			const message = {
				address: "/rnbo/inst/control/unload",
				args: [
					{ type: "i", value: deviceIndex }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to unload patcher",
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const loadPatcherNodeOnRemote = (patcher: PatcherRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/load",
				args: [
					{ type: "i", value: -1 },
					{ type: "s", value: patcher.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load patcher ${patcher.name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

const setPatcherNodeSourcePortConnectionsOnRemote = (node: GraphPatcherNodeRecord, port: GraphPortRecord, connections: GraphConnectionRecord[]): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${node.path}/jack/connections/${port.type === ConnectionType.Audio ? "audio" : "midi"}/sources/${port.id}`,
				args: connections.length ? connections.map(conn => {
					const id = conn.sinkNodeId === GraphSystemNodeRecord.systemOutputName ? GraphSystemNodeRecord.systemName : conn.sinkNodeId;
					return {
						type: "s",
						value: `${id}:${conn.sinkPortId}`
					};
				}) : [ { type: "N", value: "" } ]
			};

			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to update connections",
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

const setPatcherNodeSinkPortConnectionsOnRemote = (device: GraphPatcherNodeRecord, port: GraphPortRecord, connections: GraphConnectionRecord[]): AppThunk =>
	(dispatch) => {

		try {
			const message = {
				address: `${device.path}/jack/connections/${port.type === ConnectionType.Audio ? "audio" : "midi"}/sinks/${port.id}`,
				args: connections.length ? connections.map(conn => {
					const id = conn.sourceNodeId === GraphSystemNodeRecord.systemInputName ? GraphSystemNodeRecord.systemName : conn.sourceNodeId;
					return {
						type: "s",
						value: `${id}:${conn.sourcePortId}`
					};
				}) : [ { type: "N", value: "" } ]
			};

			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to update connections",
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

// Editor Actions
export const createEditorConnection = (connection: Connection): AppThunk =>
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
				dispatch(setPatcherNodeSourcePortConnectionsOnRemote(sourceNode, sourcePort, connections));
			} else if (sinkNode.type === NodeType.Patcher) {
				const connections = getConnectionsForSinkNodeAndPort(state, { sinkNodeId: sinkNode.id, sinkPortId: sinkPort.id }).toArray();
				connections.push(new GraphConnectionRecord({
					sourceNodeId: sourceNode.id,
					sourcePortId: sourcePort.id,
					sinkNodeId: sinkNode.id,
					sinkPortId: sinkPort.id,
					type: sourcePort.type
				}));
				dispatch(setPatcherNodeSinkPortConnectionsOnRemote(sinkNode, sinkPort, connections));
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
				dispatch(setPatcherNodeSourcePortConnectionsOnRemote(
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
				dispatch(setPatcherNodeSinkPortConnectionsOnRemote(
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


export const removeEditorNodeById = (id: GraphNode["id"]): AppThunk =>
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

			dispatch(unloadPatcherNodeByIndexOnRemote(node.index));

		} catch (err) {
			dispatch(showNotification({
				title: "Failed to node",
				level: NotificationLevel.error,
				message: err.message
			}));
			console.error(err);
		}
	};

export const removeEditorNodesById = (ids: GraphPatcherNode["id"][]): AppThunk =>
	(dispatch) => {
		for (const id of ids) {
			dispatch(removeEditorNodeById(id));
		}
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
		const node = getNode(state, id);
		if (!node) return;
		dispatch(setNode(node.updatePosition(x, y)));
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

// Updates from OSCQuery Runner Remote
export const updatePatcherNodeSourcePortConnections = (index: number, portId: GraphPortRecord["id"], sinks: string[]): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const sourceNode = getNodeByIndex(state, index);
			if (sourceNode?.type !== NodeType.Patcher) return;

			const sourcePort = sourceNode.getPort(portId);
			if (!sourcePort) return;

			const existingConnections = getConnectionsForSourceNodeAndPort(state, { sourceNodeId: sourceNode.id, sourcePortId: sourcePort.id });
			dispatch(deleteConnections(existingConnections.valueSeq().toArray()));

			const connections = [];
			for (const sink of sinks) {
				const [sinkNodeId, sinkPortId] = sink.split(":");

				const sinkNode = getNode(state, sinkNodeId === GraphSystemNodeRecord.systemName ? GraphSystemNodeRecord.systemOutputName : sinkNodeId);
				if (!sinkNode) continue;
				const sinkPort = sinkNode.getPort(sinkPortId);
				if (!sinkPort) continue;

				connections.push(new GraphConnectionRecord({
					sourceNodeId: sourceNode.id,
					sourcePortId: sourcePort.id,
					sinkNodeId: sinkNode.id,
					sinkPortId: sinkPort.id,
					type: sourcePort.type
				}));
			}

			if (connections.length) dispatch(setConnections(connections));
		} catch (e) {
			console.log(e);
		}
	};

export const updatePatcherNodeSinkPortConnections = (index: number, portId: GraphPortRecord["id"], sources: string[]): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const sinkNode = getNodeByIndex(state, index);
			if (sinkNode?.type !== NodeType.Patcher) return;

			const sinkPort = sinkNode.getPort(portId);
			if (!sinkPort) return;

			const existingConnections = getConnectionsForSinkNodeAndPort(state, { sinkNodeId: sinkNode.id, sinkPortId: sinkPort.id });
			dispatch(deleteConnections(existingConnections.valueSeq().toArray()));

			const connections = [];
			for (const source of sources) {
				const [sourceNodeId, sourcePortId] = source.split(":");

				const sourceNode = getNode(state, sourceNodeId === GraphSystemNodeRecord.systemName ? GraphSystemNodeRecord.systemInputName : sourceNodeId);
				if (!sourceNode) continue;

				const sourcePort = sourceNode.getPort(sourcePortId);
				if (!sourcePort) continue;

				connections.push(new GraphConnectionRecord({
					sourceNodeId: sourceNode.id,
					sourcePortId: sourcePort.id,
					sinkNodeId: sinkNode.id,
					sinkPortId: sinkPort.id,
					type: sourcePort.type
				}));
			}

			if (connections.length) dispatch(setConnections(connections));

		} catch (e) {
			console.log(e);
		}
	};

export const addPatcherNode = (desc: OSCQueryRNBOInstance): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const existingNodes = getNodes(state).valueSeq().toArray();

		// Create Node
		let node = GraphPatcherNodeRecord.fromDescription(desc);
		const { x, y } = getNodeCoordinates(node, existingNodes);
		node = node.updatePosition(x, y);

		dispatch(setNode(node));

		// Create Edges
		const connections = GraphConnectionRecord.patcherNodeConnectionsFromDescription(node.id, desc.CONTENTS.jack.CONTENTS.connections);
		dispatch(setConnections(connections));

		// Create Device State
		const device = DeviceStateRecord.fromDescription(desc);
		dispatch(setDevice(device));
	};

export const removePatcherNode = (index: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const node = getNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;
			dispatch(deleteNode(node));

			const device = getDevice(state, node.id);
			if (!device) return;
			dispatch(deleteDevice(device));
		} catch (e) {
			console.log(e);
		}
	};
