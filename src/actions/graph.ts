import { Set as ImmuSet, Map as ImmuMap } from "immutable";
import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk, RootStateType } from "../lib/store";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancesState, OSCQueryRNBOJackConnections, OSCQueryRNBOJackPortInfo, OSCQuerySetMeta, OSCQuerySetNodeMeta } from "../lib/types";
import { GraphConnectionRecord, GraphNode, GraphNodeRecord, GraphPatcherNode, GraphPatcherNodeRecord, GraphPortRecord, GraphSystemNodeRecord, NodeType, PortDirection } from "../models/graph";
import { getConnection, getConnectionByNodesAndPorts, getConnectionsForSourceNodeAndPort, getNode, getPatcherNodeByIndex, getNodes, getSystemNodeByJackNameAndDirection, getConnections } from "../selectors/graph";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { DeviceStateRecord } from "../models/device";
import { deleteDevice, setDevice, setDevices } from "./instances";
import { getDevice } from "../selectors/instances";
import { PatcherRecord } from "../models/patcher";
import { SetRecord } from "../models/set";
import { Connection, EdgeChange, NodeChange } from "reactflow";
import { isValidConnection } from "../lib/editorUtils";
import throttle from "lodash.throttle";

const defaultNodeSpacing = 150;
const getPatcherNodeCoordinates = (node: GraphPatcherNodeRecord, nodes: GraphNodeRecord[]): { x: number, y: number } => {

	const bottomNode: GraphNodeRecord | undefined = nodes.reduce((n, current) => {
		if (current.type === NodeType.System) return n;
		if (!n && current.type === NodeType.Patcher) return current;
		return current.y > n.y ? current : n;
	}, undefined as GraphNodeRecord | undefined);

	const y = bottomNode ? bottomNode.y + bottomNode.height + defaultNodeSpacing : 0;
	return { x: 300 + defaultNodeSpacing, y };
};

const serializeSetMeta = (nodes: GraphNodeRecord[]): OSCQuerySetMeta => {
	const result: OSCQuerySetMeta = { nodes: {} };
	for (const node of nodes) {
		result.nodes[node.id] = { position: { x: node.x, y: node.y } };
	}
	return result;
};

export enum GraphActionType {
	DELETE_NODE = "DELETE_NODE",
	DELETE_NODES = "DELETE_NODES",
	SET_NODE = "SET_NODE",
	SET_NODES = "SET_NODES",
	DELETE_CONNECTION = "DELETE_CONNECTION",
	DELETE_CONNECTIONS = "DELETE_CONNECTIONS",
	SET_CONNECTION = "SET_CONNECTION",
	SET_CONNECTIONS = "SET_CONNECTIONS"
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

export type GraphAction = ISetGraphNode | ISetGraphNodes | IDeleteGraphNode | IDeleteGraphNodes
| ISetGraphConnection  | IDeleteGraphConnection | ISetGraphConnections  | IDeleteGraphConnections;

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


const getSystemNodeJackNamesFromPortInfo = (jackPortsInfo: OSCQueryRNBOJackPortInfo, patcherNodes: GraphPatcherNodeRecord[]): string[] => {
	const pNodeIds = new Set(patcherNodes.map(pn => pn.id));
	const portNames = [
		...(jackPortsInfo.CONTENTS?.audio?.CONTENTS?.sources?.VALUE || []),
		...(jackPortsInfo.CONTENTS?.midi?.CONTENTS?.sources?.VALUE || []),
		...(jackPortsInfo.CONTENTS?.audio?.CONTENTS?.sinks?.VALUE || []),
		...(jackPortsInfo.CONTENTS?.midi?.CONTENTS?.sinks?.VALUE || [])
	];

	return portNames.reduce((result, portName) => {
		const [nodeName] = portName.split(":");
		if (!pNodeIds.has(nodeName) && nodeName.startsWith("system")) result.push(nodeName);
		return result;
	}, [] as string[]);
};

export const initNodes = (jackPortsInfo: OSCQueryRNBOJackPortInfo, instanceInfo: OSCQueryRNBOInstancesState): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const existingNodes = getNodes(state);

		const devices: DeviceStateRecord[] = [];
		const patcherNodes: GraphPatcherNodeRecord[] = [];

		let meta: OSCQuerySetMeta = { nodes: {} };
		try {
			meta = JSON.parse(instanceInfo.CONTENTS.control.CONTENTS.sets.CONTENTS.meta.VALUE as string || '{ "nodes": {} }') as OSCQuerySetMeta;
		} catch (err) {
			console.warn(`Failed to parse Set Meta Info: ${err.message}`);
		}

		for (const [key, value] of Object.entries(instanceInfo.CONTENTS)) {
			if (!/^\d+$/.test(key)) continue;
			const info = value as OSCQueryRNBOInstance;
			let node = GraphPatcherNodeRecord.fromDescription(info);
			const nodeMeta = meta.nodes[node.id];
			if (nodeMeta) {
				node = node.updatePosition(nodeMeta.position.x, nodeMeta.position.y);
			} else {
				const { x, y } = getPatcherNodeCoordinates(node, patcherNodes);
				node = node.updatePosition(x, y);
			}

			patcherNodes.push(node);
			devices.push(DeviceStateRecord.fromDescription(info));
		}

		// Build a list of all Jack generated names that have not been used for PatcherNodes above
		// as we assume moving forward that they are SystemNames
		const systemJackNames = ImmuSet<string>(getSystemNodeJackNamesFromPortInfo(jackPortsInfo, patcherNodes));

		let systemInputY = -defaultNodeSpacing;
		let systemOutputY = -defaultNodeSpacing;

		const systemNodes: GraphSystemNodeRecord[] = GraphSystemNodeRecord
			.fromDescription(systemJackNames, jackPortsInfo)
			.map(sysNode => {
				const nodeMeta = meta.nodes[sysNode.id];
				if (nodeMeta) {
					return sysNode.updatePosition(nodeMeta.position.x, nodeMeta.position.y);
				}

				let node = sysNode;
				if (node.id.endsWith(GraphSystemNodeRecord.inputSuffix)) {
					node = node.updatePosition(
						0,
						systemInputY + defaultNodeSpacing
					);
					systemInputY = node.y + node.contentHeight;
				} else {
					node = node.updatePosition(
						(node.width + defaultNodeSpacing ) * 2,
						systemOutputY + defaultNodeSpacing
					);
					systemOutputY = node.y + node.contentHeight;
				}

				return node;
			});

		dispatch(deleteNodes(existingNodes.valueSeq().toArray()));
		dispatch(setNodes([...systemNodes, ...patcherNodes]));
		dispatch(setDevices(devices));
	};


const createConnectionRecordsFromSinkList = (state: RootStateType, sourceNode: GraphNodeRecord, sourcePort: GraphPortRecord, sinks: string[]): GraphConnectionRecord[] => {
	const connectionRecords: GraphConnectionRecord[] = [];

	for (const sink of sinks) {
		const [sinkNodeName, sinkPortId] = sink.split(":");

		const sinkNode = getNode(state, sinkNodeName) || getSystemNodeByJackNameAndDirection(state, sinkNodeName, PortDirection.Sink);
		if (!sinkNode) continue;

		const sinkPort = sinkNode.getPort(sinkPortId);
		if (!sinkPort) continue;

		connectionRecords.push(new GraphConnectionRecord({
			sinkNodeId: sinkNode.id,
			sinkPortId: sinkPort.id,
			sourceNodeId: sourceNode.id,
			sourcePortId: sourcePort.id,
			type: sourcePort.type
		}));
	}

	return connectionRecords;
};

export const initConnections = (connectionsInfo: OSCQueryRNBOJackConnections): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const connectionRecords: GraphConnectionRecord[] = [];

		for (const [source, connections] of Object.entries(connectionsInfo.CONTENTS.audio?.CONTENTS || {})) {
			const [sourceNodeName, sourcePortId] = source.split(":");

			const sourceNode = getNode(state, sourceNodeName) || getSystemNodeByJackNameAndDirection(state, sourceNodeName, PortDirection.Source);
			if (!sourceNode) continue;

			const sourcePort = sourceNode.getPort(sourcePortId);
			if (!sourcePort) continue;

			connectionRecords.push(...createConnectionRecordsFromSinkList(state, sourceNode, sourcePort, connections.VALUE));
		}

		for (const [source, connections] of Object.entries(connectionsInfo.CONTENTS.midi?.CONTENTS || {})) {
			const [sourceNodeName, sourcePortId] = source.split(":");

			const sourceNode = getNode(state, sourceNodeName) || getSystemNodeByJackNameAndDirection(state, sourceNodeName, PortDirection.Source);
			if (!sourceNode) continue;

			const sourcePort = sourceNode.getPort(sourcePortId);
			if (!sourcePort) continue;
			connectionRecords.push(...createConnectionRecordsFromSinkList(state, sourceNode, sourcePort, connections.VALUE));
		}

		dispatch(deleteConnections(getConnections(state).valueSeq().toArray()));
		dispatch(setConnections(connectionRecords));
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

export const loadSetOnRemote = (name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/load",
				args: [
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load set ${name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const saveSetOnRemote = (name: string): AppThunk =>
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

export const destroySetOnRemote = (name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/destroy",
				args: [
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete set ${name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const renameSetOnRemote = (oldName: string, newName: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: "/rnbo/inst/control/sets/rename",
				args: [
					{ type: "s", value: oldName },
					{ type: "s", value: newName }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to rename set ${oldName} -> ${newName}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

const doUpdateNodesMeta = throttle((nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>) => {
	try {
		const meta = serializeSetMeta(nodes.valueSeq().toArray());

		const message = {
			address: "/rnbo/inst/control/sets/meta",
			args: [
				{ type: "s", value: JSON.stringify(meta) }
			]
		};
		oscQueryBridge.sendPacket(writePacket(message));
	} catch (err) {
		console.warn(`Failed to update Set Meta on remote: ${err.message}`);
	}

}, 150, { leading: true, trailing: true });

const updateSetMetaOnRemote = (): AppThunk => (dispatch, getState) => doUpdateNodesMeta(getNodes(getState()));

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

			const message = {
				address: "/rnbo/jack/connections/connect",
				args: [
					{ type: "s", value: `${sourceNode.jackName}:${sourcePort.id}` },
					{ type: "s", value: `${sinkNode.jackName}:${sinkPort.id}` }
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

			const sourceNode = getNode(state, connection.sourceNodeId);
			if (!sourceNode) throw new Error(`Node with id ${connection.sourceNodeId} does not exist.`);

			const sourcePort = sourceNode.getPort(connection.sourcePortId);
			if (!sourcePort) throw new Error(`Port with id ${connection.sourcePortId} does not exist on node ${sourceNode.id}.`);

			const sinkNode = getNode(state, connection.sinkNodeId);
			if (!sinkNode) throw new Error(`Node with id ${connection.sinkNodeId} does not exist.`);

			const sinkPort = sinkNode.getPort(connection.sinkPortId);
			if (!sinkPort) throw new Error(`Port with id ${connection.sinkPortId} does not exist on node ${sinkNode.id}.`);

			const message = {
				address: "/rnbo/jack/connections/disconnect",
				args: [
					{ type: "s", value: `${sourceNode.jackName}:${sourcePort.id}` },
					{ type: "s", value: `${sinkNode.jackName}:${sinkPort.id}` }
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

			dispatch(unloadPatcherNodeByIndexOnRemote(node.index));
			if (updateSetMeta) doUpdateNodesMeta(getNodes(state).delete(node.id));

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
	(dispatch, getState) => {
		for (const id of ids) {
			dispatch(removeEditorNodeById(id, false));
		}
		// Only at the end update the meta to ensure all coord data has been removed
		doUpdateNodesMeta(getNodes(getState()).deleteAll(ids));
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
		dispatch(updateSetMetaOnRemote());
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
export const updateSourcePortConnections = (source: string, sinks: string[]): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const [sourceNodeName, sourcePortId] = source.split(":");

			const sourceNode = getNode(state, sourceNodeName) || getSystemNodeByJackNameAndDirection(state, sourceNodeName, PortDirection.Source);
			if (!sourceNode) return;

			const sourcePort = sourceNode.getPort(sourcePortId);
			if (!sourcePort) return;

			// Delete old connections
			const existingConnections = getConnectionsForSourceNodeAndPort(state, { sourceNodeId: sourceNode.id, sourcePortId: sourcePort.id });
			dispatch(deleteConnections(existingConnections.valueSeq().toArray()));

			// Set new connections
			const connections = createConnectionRecordsFromSinkList(state, sourceNode, sourcePort, sinks);
			if (connections.length) dispatch(setConnections(connections));

		} catch (e) {
			console.log(e);
		}
	};

export const updateSetMeta = (metaString: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const meta = JSON.parse(metaString) as OSCQuerySetMeta;
			const state = getState();

			const nodes: GraphNodeRecord[] = [];
			for (const [id, nodeMeta] of Object.entries(meta.nodes)) {
				const node = getNode(state, id);
				if (!node) continue;

				const updatedNode = node.updatePosition(nodeMeta.position.x, nodeMeta.position.y);
				if (node === updatedNode) continue;

				nodes.push(updatedNode);
			}

			dispatch(setNodes(nodes));
		} catch (err) {
			console.warn(`Failed to update local Set Meta: ${err.message}`);
		}
	};

export const addPatcherNode = (desc: OSCQueryRNBOInstance, metaString: string): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const existingNodes = getNodes(state).valueSeq().toArray();

		// Create Node
		let node = GraphPatcherNodeRecord.fromDescription(desc);
		let nodeMeta: OSCQuerySetNodeMeta | undefined = undefined;
		try {
			const meta = JSON.parse(metaString) as OSCQuerySetMeta;
			nodeMeta = meta?.nodes?.[node.id];
		} catch (err) {
			console.warn(`Failed to parse Set Meta when creating new node: ${err.message}`);
		}

		const { x, y } = nodeMeta?.position || getPatcherNodeCoordinates(node, existingNodes);
		node = node.updatePosition(x, y);

		dispatch(setNode(node));

		// Create Device State
		const device = DeviceStateRecord.fromDescription(desc);
		dispatch(setDevice(device));
	};

export const removePatcherNode = (index: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const node = getPatcherNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;
			dispatch(deleteNode(node));

			const device = getDevice(state, node.id);
			if (!device) return;
			dispatch(deleteDevice(device));
		} catch (e) {
			console.log(e);
		}
	};
