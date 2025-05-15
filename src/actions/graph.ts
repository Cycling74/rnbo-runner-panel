import { writePacket } from "osc/dist/osc-browser";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk, RootStateType } from "../lib/store";
import { OSCQueryRNBOJackConnections, OSCQueryRNBOJackPortInfo, OSCQuerySetMeta } from "../lib/types";
import { GraphConnectionRecord, GraphNodeRecord, GraphPortRecord, NodePositionRecord, NodeType } from "../models/graph";
import { getConnectionsForSourcePort, getNode, getNodes, getConnections, getPorts, getPort, getNodePositions, getNodePosition, getEditorNodesAndPorts } from "../selectors/graph";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { PatcherExportRecord } from "../models/patcher";
import { updateSetMetaOnRemoteFromNodes } from "./meta";
import { calculateLayout } from "../lib/editorUtils";
import { getGraphEditorInstance } from "../selectors/editor";
import Router from "next/router";
import { DialogResult, showConfirmDialog } from "../lib/dialogs";
import { getPatcherInstance } from "../selectors/patchers";

class TempPatcherInstanceCoordinatesStore {
	constructor(
		public x: number = 0,
		public y: number = 0
	) {}

	public setCoordinates({ x, y }: { x: number, y: number }): void {
		this.x = x;
		this.y = y;
	}

	public get xWithMargin(): number {
		return this.x + 50;
	}

	public get yWithMargin(): number {
		return this.y + 50;
	}
}

const patcherInstanceCoordinatesStore = new TempPatcherInstanceCoordinatesStore();

export enum GraphActionType {

	SET_NODE = "SET_NODE",
	SET_NODES = "SET_NODES",
	DELETE_NODE = "DELETE_NODE",
	DELETE_NODES = "DELETE_NODES",

	SET_NODE_POSITION = "SET_NODE_POSITION",
	SET_NODE_POSITIONS = "SET_NODE_POSITIONS",
	DELETE_NODE_POSITION = "DELETE_NODE_POSITION",
	DELETE_NODE_POSITIONS = "DELETE_NODE_POSITIONS",

	SET_CONNECTION = "SET_CONNECTION",
	SET_CONNECTIONS = "SET_CONNECTIONS",
	DELETE_CONNECTION = "DELETE_CONNECTION",
	DELETE_CONNECTIONS = "DELETE_CONNECTIONS",

	SET_PORT = "SET_PORT",
	SET_PORTS = "SET_PORTS",
	DELETE_PORT = "DELETE_PORT",
	DELETE_PORTS = "DELETE_PORTS",
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

export interface ISetGraphNodePosition extends ActionBase {
	type: GraphActionType.SET_NODE_POSITION;
	payload: {
		position: NodePositionRecord;
	};
}

export interface ISetGraphNodePositions extends ActionBase {
	type: GraphActionType.SET_NODE_POSITIONS;
	payload: {
		positions: NodePositionRecord[];
	};
}

export interface IDeleteGraphNodePosition extends ActionBase {
	type: GraphActionType.DELETE_NODE_POSITION;
	payload: {
		position: NodePositionRecord;
	};
}

export interface IDeleteGraphNodePositions extends ActionBase {
	type: GraphActionType.DELETE_NODE_POSITIONS;
	payload: {
		positions: NodePositionRecord[];
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

export interface ISetGraphPort extends ActionBase {
	type: GraphActionType.SET_PORT;
	payload: {
		port: GraphPortRecord;
	};
}

export interface ISetGraphPorts extends ActionBase {
	type: GraphActionType.SET_PORTS;
	payload: {
		ports: GraphPortRecord[];
	};
}

export interface IDeleteGraphPort extends ActionBase {
	type: GraphActionType.DELETE_PORT;
	payload: {
		port: GraphPortRecord;
	};
}

export interface IDeleteGraphPorts extends ActionBase {
	type: GraphActionType.DELETE_PORTS;
	payload: {
		ports: GraphPortRecord[];
	};
}

export type GraphAction = ISetGraphNode | ISetGraphNodes | IDeleteGraphNode | IDeleteGraphNodes
| ISetGraphNodePosition | ISetGraphNodePositions | IDeleteGraphNodePosition | IDeleteGraphNodePositions
| ISetGraphConnection  | IDeleteGraphConnection | ISetGraphConnections  | IDeleteGraphConnections
| ISetGraphPort | ISetGraphPorts | IDeleteGraphPort | IDeleteGraphPorts;


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

export const setNodePosition = (position: NodePositionRecord): GraphAction => {
	return {
		type: GraphActionType.SET_NODE_POSITION,
		payload: {
			position
		}
	};
};

export const setNodePositions = (positions: NodePositionRecord[]): GraphAction => {
	return {
		type: GraphActionType.SET_NODE_POSITIONS,
		payload: {
			positions
		}
	};
};

export const deleteNodePosition = (position: NodePositionRecord): GraphAction => {
	return {
		type: GraphActionType.DELETE_NODE_POSITION,
		payload: {
			position
		}
	};
};

export const deleteNodePositions = (positions: NodePositionRecord[]): GraphAction => {
	return {
		type: GraphActionType.DELETE_NODE_POSITIONS,
		payload: {
			positions
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

export const setPort = (port: GraphPortRecord): GraphAction => {
	return {
		type: GraphActionType.SET_PORT,
		payload: {
			port
		}
	};
};

export const setPorts = (ports: GraphPortRecord[]): GraphAction => {
	return {
		type: GraphActionType.SET_PORTS,
		payload: {
			ports
		}
	};
};

export const deletePort = (port: GraphPortRecord): GraphAction => {
	return {
		type: GraphActionType.DELETE_PORT,
		payload: {
			port
		}
	};
};

export const deletePortById = (id: GraphPortRecord["id"]): AppThunk =>
	(dispatch, getState) => {
		const port = getPort(getState(), id);
		if (!port) return;
		dispatch(deletePort(port));
	};

export const deletePorts = (ports: GraphPortRecord[]): GraphAction => {
	return {
		type: GraphActionType.DELETE_PORTS,
		payload: {
			ports
		}
	};
};

// Meta Handling
export const updateSetMetaFromRemote = (setMeta: OSCQuerySetMeta): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const hasExistingPositionData = Object.keys(setMeta.nodes).length > 0;
			const positions: NodePositionRecord[] = [];

			if (hasExistingPositionData) {
				const remainingNodeIds = new Set<string>(getNodes(state).valueSeq().map(n => n.id).toArray());
				const currentPositions = getNodePositions(state);

				for (const [id, nodeMeta] of Object.entries(setMeta.nodes)) {
					const pos = currentPositions.has(id)
						? currentPositions.get(id).updatePosition(nodeMeta.position.x, nodeMeta.position.y)
						:	NodePositionRecord.fromDescription(id, nodeMeta.position.x, nodeMeta.position.y);

					positions.push(pos);
					remainingNodeIds.delete(id);
				}

				// Ensure that all nodes have a position
				if (remainingNodeIds.size > 0) {
					let offset = -1;
					const coords = getGraphEditorInstance(getState())?.project({ x: 0, y: 0 }) || { x: 0, y: 0 };
					for (const nodeId of Array.from(remainingNodeIds.values())) {
						if (!currentPositions.has(nodeId)) {
							offset++;
							positions.push(NodePositionRecord.fromDescription(nodeId, coords.x + offset * 75, coords.y + offset * 75));
						}
					}
				}
			} else {
				positions.push(...(calculateLayout(
					getPorts(state),
					getConnections(state),
					getEditorNodesAndPorts(state)
				)));
			}

			dispatch(setNodePositions(positions));
		} catch (err) {
			console.warn(`Failed to update local Set Meta: ${err.message}`);
		}
	};

const makePorts = (
	propertyMap: OSCQueryRNBOJackPortInfo["CONTENTS"]["properties"]["CONTENTS"],
	aliasesMap:  OSCQueryRNBOJackPortInfo["CONTENTS"]["aliases"]["CONTENTS"]
): GraphPortRecord[] => {
	const result: GraphPortRecord[] = [];

	for (const [id, properties] of Object.entries(propertyMap)) {
		let port = GraphPortRecord.fromDescription(id, properties.VALUE || "{}");
		if (aliasesMap[port.id]) port = port.setAliases(aliasesMap[port.id].VALUE);

		result.push(port);
	}

	return result;
};

export const initPorts = (jackPortsInfo: OSCQueryRNBOJackPortInfo): AppThunk =>
	(dispatch, getState) => {

		const state = getState();

		const portProperties = jackPortsInfo.CONTENTS?.properties?.CONTENTS || {};
		const portAliases = jackPortsInfo.CONTENTS.aliases?.CONTENTS || {};

		const ports: Array<GraphPortRecord> = makePorts(portProperties, portAliases);
		const nodes: Map<GraphNodeRecord["id"], GraphNodeRecord> = new Map<GraphNodeRecord["id"], GraphNodeRecord>();

		for (const port of ports) {
			if (nodes.has(port.nodeId)) continue;// already created

			const node: GraphNodeRecord = GraphNodeRecord.fromDescription(
				port.nodeId,
				port.isPatcherInstancePort ? NodeType.Patcher : NodeType.System,
				port.instanceId
			);

			nodes.set(node.id, node);
		}

		// Clean up existing state
		dispatch(deleteNodes(getNodes(state).valueSeq().toArray()));
		dispatch(deletePorts(getPorts(state).valueSeq().toArray()));

		// Set new node and ports state
		dispatch(setNodes(Array.from(nodes.values())));
		dispatch(setPorts(ports));
	};


const createConnectionRecordsFromSinkList = (
	state: RootStateType,
	sourcePort: GraphPortRecord,
	sinks: string[]
): GraphConnectionRecord[] => {
	const connectionRecords: GraphConnectionRecord[] = [];

	for (const sinkPortId of sinks) {
		const sinkPort = getPort(state, sinkPortId);
		if (!sinkPort) continue;

		connectionRecords.push(new GraphConnectionRecord({
			sinkPortId: sinkPort.id,
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

		for (const [sourcePortId, connections] of Object.entries(connectionsInfo.CONTENTS.audio?.CONTENTS || {})) {

			const sourcePort = getPort(state, sourcePortId);
			if (!sourcePort) continue;

			connectionRecords.push(...createConnectionRecordsFromSinkList(state, sourcePort, connections.VALUE));
		}

		for (const [sourcePortId, connections] of Object.entries(connectionsInfo.CONTENTS.midi?.CONTENTS || {})) {
			const sourcePort = getPort(state, sourcePortId);
			if (!sourcePort) continue;

			connectionRecords.push(...createConnectionRecordsFromSinkList(state, sourcePort, connections.VALUE));
		}

		dispatch(deleteConnections(getConnections(state).valueSeq().toArray()));
		dispatch(setConnections(connectionRecords));
	};

export const addPort = (id: GraphPortRecord["id"], properties: string = "{}"): AppThunk =>
	(dispatch, getState) => {

		const port = getPort(getState(), id);
		if (port) return;
		dispatch(setPort(GraphPortRecord.fromDescription(id, properties)));
	};

export const setPortAliases = (id: GraphPortRecord["id"], aliases: string []): AppThunk =>
	(dispatch, getState) => {
		const port = getPort(getState(), id);
		if (!port) return;

		dispatch(setPort(port.setAliases(aliases)));
	};

export const deletePortAliases = (id: GraphPortRecord["id"]): AppThunk =>
	(dispatch, getState) => {
		const port = getPort(getState(), id);
		if (!port) return;

		dispatch(setPort(port.clearAliases()));
	};

export const setPortProperties = (id: GraphPortRecord["id"], properties: string): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const port = getPort(state, id)?.setProperties(properties) || GraphPortRecord.fromDescription(id, properties);

		// Create Port
		dispatch(setPort(port));

		if (!getNodePosition(state, port.nodeId)) {
			let pos: NodePositionRecord;
			if (port.isPatcherInstancePort) {
				pos = NodePositionRecord.fromDescription(port.nodeId, patcherInstanceCoordinatesStore.xWithMargin, patcherInstanceCoordinatesStore.yWithMargin);
			} else {
				const coords = getGraphEditorInstance(getState())?.project({ x: 0, y: 0 }) || { x: 0, y: 0 };
				pos = getNodePosition(state, port.nodeId) || NodePositionRecord.fromDescription(port.nodeId, coords.x, coords.y);
			}
			dispatch(setNodePosition(pos));
		}

		const node = getNode(state, port.nodeId) || GraphNodeRecord.fromDescription(port.nodeId, port.isPatcherInstancePort ? NodeType.Patcher : NodeType.System);
		dispatch(setNode(node.set("type", port.isPatcherInstancePort ? NodeType.Patcher : NodeType.System)));
	};

// Trigger Updates on remote OSCQuery Runner
export const unloadPatcherNodeOnRemote = (instanceId: string): AppThunk =>
	async (dispatch, getState) => {
		try {

			const state = getState();
			const pInstance = getPatcherInstance(state, instanceId);
			if (!pInstance) return;

			const dialogResult = await showConfirmDialog({
				text: `Are you sure you want to delete the device ${ pInstance?.displayName }?`,
				actions: {
					confirm: { label: "Delete Device", color: "red" }
				}
			});

			if (dialogResult === DialogResult.Cancel) {
				return;
			}

			const message = {
				address: "/rnbo/inst/control/unload",
				args: [
					{ type: "i", value: parseInt(instanceId, 10) }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));

			const nodes = getNodes(state);
			dispatch(updateSetMetaOnRemoteFromNodes(nodes.filterNot(n => n.type === NodeType.Patcher && n.instanceId === instanceId).valueSeq().toArray()));

			if (Router.asPath.startsWith(`/instances/${encodeURIComponent(pInstance.id)}`)) {
				const rQuery = { ...Router.query };
				delete rQuery.id;
				Router.push({ pathname: "/", query: rQuery });
			}
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to unload device",
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};

export const loadPatcherNodeOnRemote = (patcher: PatcherExportRecord): AppThunk =>
	(dispatch, getState) => {
		try {
			patcherInstanceCoordinatesStore.setCoordinates(
				getGraphEditorInstance(getState())?.project({ x: 0, y: 0 }) || { x: 0, y: 0 }
			);

			const message = {
				address: "/rnbo/inst/control/load",
				args: [
					{ type: "i", value: -2 }, // allocate new index AND don't auto connect
					{ type: "s", value: patcher.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load device ${patcher.name}`,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};

// Updates from OSCQuery Runner Remote
export const updateSourcePortConnections = (sourcePortId: string, sinks: string[]): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const sourcePort = getPort(state, sourcePortId);
			if (!sourcePort) return;

			// Delete old connections
			const existingConnections = getConnectionsForSourcePort(state, sourcePort.id);
			dispatch(deleteConnections(existingConnections.valueSeq().toArray()));

			// Set new connections
			const connections = createConnectionRecordsFromSinkList(state, sourcePort, sinks);
			if (connections.length) dispatch(setConnections(connections));

		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to update node connections for with port "${sourcePortId}" `,
				message: "Please check the console for further details."
			}));
			console.error(err);
		}
	};
