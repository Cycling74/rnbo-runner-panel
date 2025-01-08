import { Set as ImmuSet, Map as ImmuMap } from "immutable";
import { writePacket } from "osc";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk, RootStateType } from "../lib/store";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancesState, OSCQueryRNBOJackConnections, OSCQueryRNBOJackPortInfo, OSCQuerySetMeta, OSCQuerySetNodeMeta } from "../lib/types";
import { ConnectionType, GraphConnectionRecord, GraphControlNodeRecord, GraphNodeRecord, GraphPatcherNodeRecord, GraphPortRecord, GraphSystemNodeRecord, NodeType, PortDirection, calculateNodeContentHeight, createNodePorts } from "../models/graph";
import { getConnectionsForSourceNodeAndPort, getNode, getPatcherNodeByIndex, getNodes, getSystemNodeByJackNameAndDirection, getConnections, getPatcherNodes, getSystemNodes, getControlNodes } from "../selectors/graph";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { PatcherInstanceRecord } from "../models/instance";
import { deleteInstance, setInstance, setInstanceMessageInports, setInstanceMessageOutports, setInstanceParameters, setInstances } from "./patchers";
import { getPatcherInstance, getPatcherExports } from "../selectors/patchers";
import { PatcherExportRecord } from "../models/patcher";
import { defaultNodeGap, nodeDefaultWidth, nodeHeaderHeight } from "../lib/constants";
import { getGraphEditorInstance } from "../selectors/editor";
import { ParameterRecord } from "../models/parameter";
import { MessagePortRecord } from "../models/messageport";
import { deserializeSetMeta, updateSetMetaOnRemoteFromNodes } from "./meta";

const getPatcherOrControlNodeCoordinates = (node: GraphPatcherNodeRecord | GraphControlNodeRecord, nodes: GraphNodeRecord[]): { x: number, y: number } => {

	let y = 0;
	if (node instanceof GraphControlNodeRecord) {
		const bottomNode: GraphNodeRecord | undefined = nodes.reduce((n, current) => {
			if (current.type === NodeType.System) return n;
			if (!n) return current;
			return current.y > n.y ? current : n;
		}, undefined as GraphNodeRecord | undefined);

		y = bottomNode ? bottomNode.y + bottomNode.height + defaultNodeGap : 0;
	}

	return { x: nodeDefaultWidth + defaultNodeGap, y };
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
	SET_PORT_ALIASES_LIST = "SET_PORT_ALIASES_LIST",
	SET_PORTS_ALIASES_LIST = "SET_PORTS_ALIASES_LIST",
	DELETE_PORT_ALIASES_LIST = "DELETE_PORT_ALIASES_LIST",
	DELETE_PORTS_ALIASES_LIST = "DELETE_PORTS_ALIASES_LIST"
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

export interface ISetGraphPortAliasesList extends ActionBase {
	type: GraphActionType.SET_PORT_ALIASES_LIST;
	payload: {
		portName: GraphPortRecord["portName"];
		aliases: string[];
	};
}

export interface ISetGraphPortsAliasesList extends ActionBase {
	type: GraphActionType.SET_PORTS_ALIASES_LIST;
	payload: {
		aliases: Array<{ portName: GraphPortRecord["portName"]; aliases: string[]; }>;
	};
}

export interface IDeleteGraphPortAliasesList extends ActionBase {
	type: GraphActionType.DELETE_PORT_ALIASES_LIST;
	payload: {
		portName: GraphPortRecord["portName"];
	};
}

export interface IDeleteGraphPortsAliasesList extends ActionBase {
	type: GraphActionType.DELETE_PORTS_ALIASES_LIST;
	payload: {
		portNames: Array<GraphPortRecord["portName"]>;
	};
}

export type GraphAction = ISetGraphNode | ISetGraphNodes | IDeleteGraphNode | IDeleteGraphNodes
| ISetGraphConnection  | IDeleteGraphConnection | ISetGraphConnections  | IDeleteGraphConnections
| ISetGraphPortAliasesList | ISetGraphPortsAliasesList | IDeleteGraphPortAliasesList | IDeleteGraphPortsAliasesList;


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

export const setPortAliases = (portName: GraphPortRecord["portName"], aliases: string []): GraphAction => {
	return {
		type: GraphActionType.SET_PORT_ALIASES_LIST,
		payload: {
			portName,
			aliases
		}
	};
};

export const setPortsAliases = (aliases: Array<{ portName: GraphPortRecord["portName"], aliases: string []; }>): GraphAction => {
	return {
		type: GraphActionType.SET_PORTS_ALIASES_LIST,
		payload: {
			aliases
		}
	};
};

export const deletePortAliases = (portName: GraphPortRecord["portName"]): GraphAction => {
	return {
		type: GraphActionType.DELETE_PORT_ALIASES_LIST,
		payload: {
			portName
		}
	};
};

export const deletePortsAliases = (portNames: Array<GraphPortRecord["portName"]>): GraphAction => {
	return {
		type: GraphActionType.DELETE_PORTS_ALIASES_LIST,
		payload: {
			portNames
		}
	};
};

const isSystemNodeName = (name: string): boolean => (name.startsWith("system") || name.startsWith("Midi-Bridge"));

const filterSystemNodeNames = (portNames: string[], nodes: Array<GraphPatcherNodeRecord | GraphControlNodeRecord>): string[] => {
	const pNodeIds = new Set(nodes.map(pn => pn.id));
	return portNames.reduce((result, portName) => {
		const [nodeName] = portName.split(":");
		if (!pNodeIds.has(nodeName) && isSystemNodeName(nodeName)) result.push(nodeName);
		return result;
	}, [] as string[]);
};

const filterControlNodeNames = (portNames: string[], nodes: Array<GraphPatcherNodeRecord | GraphControlNodeRecord>): string[] => {
	const pNodeIds = new Set(nodes.map(pn => pn.id));
	return portNames.reduce((result, portName) => {
		const [nodeName] = portName.split(":");
		if (!pNodeIds.has(nodeName) && !isSystemNodeName(nodeName)) result.push(nodeName);
		return result;
	}, [] as string[]);
};

const getSystemNodeJackNamesFromPortInfo = (jackPortsInfo: OSCQueryRNBOJackPortInfo, nodes: Array<GraphPatcherNodeRecord | GraphControlNodeRecord>): string[] => {
	return filterSystemNodeNames(
		[
			...(jackPortsInfo.CONTENTS?.audio?.CONTENTS?.sources?.VALUE || []),
			...(jackPortsInfo.CONTENTS?.midi?.CONTENTS?.sources?.VALUE || []),
			...(jackPortsInfo.CONTENTS?.audio?.CONTENTS?.sinks?.VALUE || []),
			...(jackPortsInfo.CONTENTS?.midi?.CONTENTS?.sinks?.VALUE || [])
		],
		nodes
	);
};

const getControlNodeJackNamesFromPortInfo = (jackPortsInfo: OSCQueryRNBOJackPortInfo, nodes: Array<GraphPatcherNodeRecord | GraphControlNodeRecord>): string[] => {
	return filterControlNodeNames(
		[
			...(jackPortsInfo.CONTENTS?.audio?.CONTENTS?.sources?.VALUE || []),
			...(jackPortsInfo.CONTENTS?.midi?.CONTENTS?.sources?.VALUE || []),
			...(jackPortsInfo.CONTENTS?.audio?.CONTENTS?.sinks?.VALUE || []),
			...(jackPortsInfo.CONTENTS?.midi?.CONTENTS?.sinks?.VALUE || [])
		],
		nodes
	);
};

// Meta Handling
export const updateSetMetaFromRemote = (metaString: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const meta = deserializeSetMeta(metaString);
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


const requestMetaUpdateFromRemote = (): AppThunk =>
	async (dispatch) => {
		try {
			const data = await oscQueryBridge.getMetaState();
			dispatch(updateSetMetaFromRemote(data.VALUE));
		} catch (err) {
			console.warn(`Failed to update Set Meta from remote: ${err.message}`);
		}
	};

export const initNodes = (jackPortsInfo: OSCQueryRNBOJackPortInfo, instanceInfo: OSCQueryRNBOInstancesState): AppThunk =>
	(dispatch, getState) => {

		const state = getState();
		const existingNodes = getNodes(state);

		const instances: PatcherInstanceRecord[] = [];
		const instanceParameters: ParameterRecord[] = [];
		const instanceMessageInports: MessagePortRecord[] = [];
		const instanceMessageOutports: MessagePortRecord[] = [];
		const patcherAndControlNodes: Array<GraphPatcherNodeRecord | GraphControlNodeRecord> = [];

		const meta: OSCQuerySetMeta = deserializeSetMeta(instanceInfo.CONTENTS.control.CONTENTS.sets.CONTENTS.meta.VALUE as string);

		for (const [key, value] of Object.entries(instanceInfo.CONTENTS)) {
			if (!/^\d+$/.test(key)) continue;
			const info = value as OSCQueryRNBOInstance;
			let node = GraphPatcherNodeRecord.fromDescription(info);
			const nodeMeta = meta.nodes[node.id];
			const { x, y } = nodeMeta?.position || getPatcherOrControlNodeCoordinates(node, patcherAndControlNodes);
			node = node.updatePosition(x, y);

			patcherAndControlNodes.push(node);
			const instance = PatcherInstanceRecord.fromDescription(info);
			instances.push(instance);
			instanceParameters.push(...ParameterRecord.fromDescription(instance.index, info.CONTENTS.params));
			instanceMessageInports.push(...MessagePortRecord.fromDescription(instance.index, info.CONTENTS.messages?.CONTENTS?.in));
			instanceMessageOutports.push(...MessagePortRecord.fromDescription(instance.index, info.CONTENTS.messages?.CONTENTS?.out));
		}

		// Build a list of all Jack generated names that have not been used for PatcherNodes above
		const controlJackNames = getControlNodeJackNamesFromPortInfo(jackPortsInfo, patcherAndControlNodes);
		for (const jackName of controlJackNames) {
			let controlNode = GraphControlNodeRecord.fromDescription(jackName, {
				audioSinks: jackPortsInfo.CONTENTS.audio.CONTENTS?.sinks?.VALUE?.filter(n => n.startsWith(`${jackName}:`)) || [],
				audioSources: jackPortsInfo.CONTENTS.audio.CONTENTS?.sources?.VALUE?.filter(n => n.startsWith(`${jackName}:`)) || [],
				midiSinks: jackPortsInfo.CONTENTS.midi.CONTENTS?.sinks?.VALUE?.filter(n => n.startsWith(`${jackName}:`)) || [],
				midiSources: jackPortsInfo.CONTENTS.midi.CONTENTS?.sources?.VALUE?.filter(n => n.startsWith(`${jackName}:`)) || []
			});

			const nodeMeta = meta.nodes[controlNode.id];
			if (nodeMeta) {
				controlNode = controlNode.updatePosition(nodeMeta.position.x, nodeMeta.position.y);
			} else {
				const { x, y } = getPatcherOrControlNodeCoordinates(controlNode, patcherAndControlNodes);
				controlNode = controlNode.updatePosition(x, y);
			}

			patcherAndControlNodes.push(controlNode);
		}

		// Build a list of all Jack generated names that have not been used for PatcherNodes above
		// as we assume moving forward that they are SystemNames
		const systemJackNames = ImmuSet<string>(getSystemNodeJackNamesFromPortInfo(jackPortsInfo, patcherAndControlNodes));

		let systemInputY = -defaultNodeGap;
		let systemOutputY = -defaultNodeGap;

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
						systemInputY + defaultNodeGap
					);
					systemInputY = node.y + node.contentHeight;
				} else {
					node = node.updatePosition(
						node.width + 300 + defaultNodeGap * 2,
						systemOutputY + defaultNodeGap
					);
					systemOutputY = node.y + node.contentHeight;
				}

				return node;
			});

		const portAliases: Array<{ portName: GraphPortRecord["portName"]; aliases: string []; }> = [];
		for (const [portName, aliasInfo] of Object.entries(jackPortsInfo.CONTENTS.aliases?.CONTENTS || {})) {
			portAliases.push({ portName, aliases: aliasInfo.VALUE });
		}

		dispatch(deleteNodes(existingNodes.valueSeq().toArray()));
		dispatch(setNodes([...systemNodes, ...patcherAndControlNodes]));
		dispatch(setInstances(instances));
		dispatch(setInstanceParameters(instanceParameters));
		dispatch(setInstanceMessageInports(instanceMessageInports));
		dispatch(setInstanceMessageOutports(instanceMessageOutports));
		dispatch(setPortsAliases(portAliases));
	};


const createConnectionRecordsFromSinkList = (state: RootStateType, sourceNode: GraphNodeRecord, sourcePort: GraphPortRecord, sinks: string[]): GraphConnectionRecord[] => {
	const connectionRecords: GraphConnectionRecord[] = [];

	for (const sink of sinks) {
		const [sinkNodeName, ...rest] = sink.split(":");
		const sinkPortId = rest.join(":");

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
			const [sourceNodeName, ...rest] = source.split(":");
			const sourcePortId = rest.join(":");

			const sourceNode = getNode(state, sourceNodeName) || getSystemNodeByJackNameAndDirection(state, sourceNodeName, PortDirection.Source);
			if (!sourceNode) continue;

			const sourcePort = sourceNode.getPort(sourcePortId);
			if (!sourcePort) continue;

			connectionRecords.push(...createConnectionRecordsFromSinkList(state, sourceNode, sourcePort, connections.VALUE));
		}

		for (const [source, connections] of Object.entries(connectionsInfo.CONTENTS.midi?.CONTENTS || {})) {
			const [sourceNodeName, ...rest] = source.split(":");
			const sourcePortId = rest.join(":");

			const sourceNode = getNode(state, sourceNodeName) || getSystemNodeByJackNameAndDirection(state, sourceNodeName, PortDirection.Source);
			if (!sourceNode) continue;

			const sourcePort = sourceNode.getPort(sourcePortId);
			if (!sourcePort) continue;
			connectionRecords.push(...createConnectionRecordsFromSinkList(state, sourceNode, sourcePort, connections.VALUE));
		}

		dispatch(deleteConnections(getConnections(state).valueSeq().toArray()));
		dispatch(setConnections(connectionRecords));
	};

// Update System or Control I/O
export const updateSystemOrControlPortInfo = (type: ConnectionType, direction: PortDirection, names: string[]): AppThunk =>
	(dispatch, getState) => {

		const state = getState();

		const patcherNodes = getPatcherNodes(state).valueSeq().toArray();
		const controlNodes = getControlNodes(state).valueSeq().toArray();
		const systemNodes = getSystemNodes(state).valueSeq().toArray();

		// Using this set to keep track of newly created System and Control Nodes
		const systemOrControlJackNames = new Set([
			...filterSystemNodeNames(names, patcherNodes),
			...filterControlNodeNames(names, patcherNodes)
		]);

		const currentSystemOrControlNodes = [...controlNodes, ...systemNodes];
		const deletedNodes: Array<GraphSystemNodeRecord | GraphControlNodeRecord> = [];
		const updatedNodes: Array<GraphSystemNodeRecord | GraphControlNodeRecord> = [];

		for (const node of currentSystemOrControlNodes) {

			if (node.type === NodeType.System && node.direction !== direction) { // only system nodes have a "direction" as we split them in two
				// if not the same direction => ignore for now, another call will handle that
				continue;
			}

			// Node already exists - delete from Nodes
			if (systemOrControlJackNames.has(node.jackName)) {
				systemOrControlJackNames.delete(node.jackName);
			}

			// Create Ports relevant for this node for type and direction
			const newPorts = createNodePorts(node.jackName, type, direction, names);
			const updatedNode = node.setPortsByType(type, direction, newPorts);

			// Any Ports left or can we remove the node?
			if (updatedNode.ports.size) {
				updatedNodes.push(updatedNode);
			} else {
				deletedNodes.push(updatedNode);
			}
		}

		// Create New Nodes
		let systemInputY = -defaultNodeGap;
		let systemOutputY = -defaultNodeGap;

		const patchers = getPatcherExports(state).valueSeq();
		const missingSystemOrControlJackName = Array.from(systemOrControlJackNames.values())
			.filter(name => !patchers.find(patcher => name.startsWith(`${patcher.name}-`)));

		for (const jackName of missingSystemOrControlJackName) {

			const ports = ImmuMap<GraphPortRecord["id"], GraphPortRecord>(createNodePorts(jackName, type, direction, names).map(p => [p.id, p]));
			const contentHeight = calculateNodeContentHeight(ports);
			let node: GraphSystemNodeRecord | GraphControlNodeRecord;

			if (isSystemNodeName(jackName)) {
				// System Node Name
				node = new GraphSystemNodeRecord({
					jackName,
					direction,
					id: `${jackName}${direction === PortDirection.Source ? GraphSystemNodeRecord.inputSuffix : GraphSystemNodeRecord.outputSuffix}`,
					ports,
					selected: false,
					x: 0,
					y: 0,
					width: nodeDefaultWidth,
					height: contentHeight + nodeHeaderHeight

				});

				if (direction === PortDirection.Source) {
					node = node.updatePosition(
						0,
						systemInputY + defaultNodeGap
					);
					systemInputY = node.y + node.contentHeight;
				} else {
					node = node.updatePosition(
						node.width + 300 + defaultNodeGap * 2,
						systemOutputY + defaultNodeGap
					);
					systemOutputY = node.y + node.contentHeight;
				}

			} else {
				// Control Node
				node = new GraphControlNodeRecord({
					jackName,
					ports,
					selected: false,
					x: 0,
					y: 0,
					width: nodeDefaultWidth,
					height: contentHeight + nodeHeaderHeight
				});
				const { x, y } = getPatcherOrControlNodeCoordinates(node, [...patcherNodes, ...controlNodes]);
				node = node.updatePosition(x, y);
			}
			updatedNodes.push(node);
		}

		dispatch(deleteNodes(deletedNodes));
		dispatch(setNodes(updatedNodes));
		dispatch(requestMetaUpdateFromRemote());

	};

// Trigger Updates on remote OSCQuery Runner
export const unloadPatcherNodeByIndexOnRemote = (instanceIndex: number): AppThunk =>
	(dispatch, getState) => {
		try {

			const message = {
				address: "/rnbo/inst/control/unload",
				args: [
					{ type: "i", value: instanceIndex }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));

			const state = getState();
			const nodes = getNodes(state);
			dispatch(updateSetMetaOnRemoteFromNodes(nodes.filterNot(n => n.type === NodeType.Patcher && n.index === instanceIndex)));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: "Error while trying to unload patcher",
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

export const loadPatcherNodeOnRemote = (patcher: PatcherExportRecord): AppThunk =>
	(dispatch) => {
		try {
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
				title: `Error while trying to load patcher ${patcher.name}`,
				message: "Please check the consolor for further details."
			}));
			console.error(err);
		}
	};

// Updates from OSCQuery Runner Remote
export const updateSourcePortConnections = (source: string, sinks: string[]): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const [sourceNodeName, ...rest] = source.split(":");
			const sourcePortId = rest.join(":");

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

export const addPatcherNode = (desc: OSCQueryRNBOInstance, metaString: string): AppThunk =>
	(dispatch, getState) => {
		// Create Node
		let node = GraphPatcherNodeRecord.fromDescription(desc);
		const setMeta: OSCQuerySetMeta = deserializeSetMeta(metaString);
		const nodeMeta: OSCQuerySetNodeMeta | undefined = setMeta?.nodes?.[node.id];

		const state = getState();
		const { x, y } = nodeMeta?.position || getGraphEditorInstance(state)?.project({
			y: 0,
			x: 0
		}) || getPatcherOrControlNodeCoordinates(node, []);

		node = node.updatePosition(x, y);
		dispatch(setNode(node));

		// Create Instance State
		const instance = PatcherInstanceRecord.fromDescription(desc);
		const parameters = ParameterRecord.fromDescription(instance.index, desc.CONTENTS.params);
		const messageInports = MessagePortRecord.fromDescription(instance.index, desc.CONTENTS.messages?.CONTENTS?.in);
		const messageOutports = MessagePortRecord.fromDescription(instance.index, desc.CONTENTS.messages?.CONTENTS?.out);

		dispatch(setInstance(instance));
		dispatch(setInstanceParameters(parameters));
		dispatch(setInstanceMessageInports(messageInports));
		dispatch(setInstanceMessageOutports(messageOutports));
	};

export const removePatcherNode = (index: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const node = getPatcherNodeByIndex(state, index);
			if (node?.type !== NodeType.Patcher) return;
			dispatch(deleteNode(node));

			const instance = getPatcherInstance(state, node.id);
			if (!instance) return;

			dispatch(deleteInstance(instance));
		} catch (e) {
			console.log(e);
		}
	};
