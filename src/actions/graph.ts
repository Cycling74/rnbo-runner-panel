import { ActionBase } from "../lib/store";
import { OSCQueryRNBOInstancesState, OSCQueryRNBOJackPortInfo } from "../lib/types";
import { GraphConnectionRecord, GraphNodeRecord, GraphPatcherNodeRecord, GraphSystemNodeRecord } from "../models/graph";

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


export const initGraph = (jackPortsInfo: OSCQueryRNBOJackPortInfo, instanceInfo: OSCQueryRNBOInstancesState): GraphAction => {

	const systemNodes: GraphSystemNodeRecord[] = GraphSystemNodeRecord.fromDescription(jackPortsInfo);

	const patcherNodes: GraphPatcherNodeRecord[] = [];
	const connections: GraphConnectionRecord[] = [];

	for (const [key, value] of Object.entries(instanceInfo.CONTENTS)) {
		if (!/^\d+$/.test(key)) continue;

		const node = GraphPatcherNodeRecord.fromDescription(value);
		connections.push(...GraphConnectionRecord.connectionsFromDescription(node.id, value.CONTENTS.jack.CONTENTS.connections));
		patcherNodes.push(node);
	}

	return {
		type: GraphActionType.INIT,
		payload: {
			connections,
			nodes: [...systemNodes, ...patcherNodes]
		}
	};
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
