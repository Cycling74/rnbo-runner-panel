import { Map as ImmuMap, OrderedMap as ImmuOrderedMap, Seq } from "immutable";
import { RootStateType } from "../lib/store";
import { ConnectionType, GraphConnectionRecord, GraphNodeRecord, GraphPortRecord, NodePositionRecord, NodeType, PortDirection } from "../models/graph";
import { createSelector } from "reselect";
import { nodeDefaultWidth, nodeHeaderHeight } from "../lib/constants";
import { calculateNodeContentHeight } from "../lib/util";

export const getNodes = (state: RootStateType): ImmuMap<GraphNodeRecord["id"], GraphNodeRecord> => state.graph.nodes;
export const getPatcherNodeIdsByInstanceId = (state: RootStateType): ImmuMap<GraphNodeRecord["instanceId"], GraphNodeRecord["id"]> => state.graph.patcherNodeIdByInstanceId;

export const getNode = createSelector(
	[
		getNodes,
		(state: RootStateType, id: GraphNodeRecord["id"]): GraphNodeRecord["id"] => id

	],
	(nodes, id): GraphNodeRecord | undefined => {
		return nodes.get(id);
	}
);

export const getPatcherNodes = createSelector(
	[getNodes],
	(nodes): ImmuMap<GraphNodeRecord["id"], GraphNodeRecord> => {
		return nodes.filter(node => node.type === NodeType.Patcher) as ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>;
	}
);

export const getPatcherNodesByInstanceId = (state: RootStateType): ImmuMap<GraphNodeRecord["instanceId"], GraphNodeRecord> => {
	return ImmuMap<GraphNodeRecord["instanceId"], GraphNodeRecord>().withMutations(map => {
		state.graph.patcherNodeIdByInstanceId.forEach((nodeId, instanceId) => {
			const node = getNode(state, nodeId);
			if (node && node.type === NodeType.Patcher && node.instanceId !== undefined) map.set(instanceId, node);
		});
	});
};

export const getPatcherNodeByInstanceId = createSelector(
	[
		getNodes,
		getPatcherNodeIdsByInstanceId,
		(state: RootStateType, instanceId: GraphNodeRecord["id"]): GraphNodeRecord["id"] => instanceId
	],
	(nodes, idsByInstanceId, instanceId): GraphNodeRecord | undefined => {
		const id = idsByInstanceId.get(instanceId);
		const node = id ? nodes.get(id) : undefined;
		return node && node.type === NodeType.Patcher ? node : undefined;
	}
);

export const getFirstPatcherNodeInstanceId = createSelector(
	[
		getPatcherNodes
	],
	(nodes): string | undefined => {
		const collator = new Intl.Collator("en-US", { numeric: true });
		return nodes.size === 0 ? undefined : nodes.sort((a, b) => collator.compare(a.id, b.id)).first()?.instanceId;
	}
);

export const getNodePositions = (state: RootStateType): ImmuMap<NodePositionRecord["id"], NodePositionRecord> => state.graph.nodePositions;
export const getNodePosition = createSelector(
	[
		getNodePositions,
		(state: RootStateType, id: NodePositionRecord["id"]): NodePositionRecord["id"] => id

	],
	(positions, id): NodePositionRecord | undefined => {
		return positions.get(id);
	}
);

export const getPorts = (state: RootStateType): ImmuOrderedMap<GraphPortRecord["id"], GraphPortRecord> => state.graph.ports;

export const getPortsForTypeAndDirection = createSelector(
	[
		getPorts,
		(state: RootStateType, type: ConnectionType): ConnectionType => type,
		(state: RootStateType, type: ConnectionType, direction: PortDirection): PortDirection => direction
	],
	(ports, type, direction): ImmuOrderedMap<GraphPortRecord["id"], GraphPortRecord> => {
		return ports.filter((p) => p.type === type && p.direction === direction);
	}
);

export const getPortsForNodeId = createSelector(
	[
		getNode,
		getPorts
	],
	(node, ports): ImmuOrderedMap<GraphPortRecord["id"], GraphPortRecord> => {
		return ports.filter(p => p.nodeId === node.id);
	}
);

export const getPort = createSelector(
	[
		getPorts,
		(state: RootStateType, id: GraphPortRecord["id"]): GraphPortRecord["id"] => id

	],
	(ports, id): GraphPortRecord | undefined => {
		return ports.get(id);
	}
);

export type EditorNodePorts = {
	sinks: GraphPortRecord[];
	sources: GraphPortRecord[];
};

export type EditorNodeDimensions = {
	contentHeight: number;
	height: number;
	width: number;
};

export type EditorNodePosition = {
	x: number;
	y: number;
}

export type EditorNodeDesc = EditorNodePorts & EditorNodeDimensions & EditorNodePosition & {
	node: GraphNodeRecord;
};

export const getEditorNodesAndPorts = createSelector(
	[
		getNodes,
		getPorts,
		getNodePositions
	],
	(nodes, ports, positions): ImmuMap<GraphNodeRecord["id"], EditorNodeDesc> => {
		const portMap = new Map<GraphNodeRecord["id"], EditorNodePorts>();
		ports.forEach((port) => {
			if (port.isHidden) return;
			if (!portMap.has(port.nodeId)) portMap.set(port.nodeId, { sinks: [], sources: [] });
			portMap.get(port.nodeId)[port.direction === PortDirection.Sink ? "sinks" : "sources"].push(port);
		});

		return ImmuMap<GraphNodeRecord["id"], EditorNodeDesc>().withMutations(result => {
			nodes.forEach(node => {
				if (node.isHidden) return;

				const ports = portMap.get(node.id) || { sinks: [], sources: [] };
				const contentHeight = calculateNodeContentHeight(ports.sinks.length, ports.sources.length);
				const position = positions.get(node.id);

				const desc: EditorNodeDesc = {
					node,
					...ports,
					contentHeight,
					x: position?.x || 0,
					y: position?.y || 0,
					height: nodeHeaderHeight + contentHeight,
					width: nodeDefaultWidth
				};
				result.set(node.id, desc);
			});
		});
	}
);

export const getConnections = (state: RootStateType): ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord> => state.graph.connections;

export const getConnection = createSelector(
	[
		getConnections,
		(state: RootStateType, id: GraphConnectionRecord["id"]): GraphConnectionRecord["id"] => id
	],
	(connections, id): GraphConnectionRecord | undefined => {
		return connections.get(id);
	}
);

export type PortDesc = {
	sourcePortId: string;
	sinkPortId: string;
};

export const getConnectionByPorts = createSelector(
	[
		getConnections,
		(state: RootStateType, desc: PortDesc): PortDesc => desc
	],
	(connections, { sourcePortId, sinkPortId }): GraphConnectionRecord | undefined => {
		return connections.get(GraphConnectionRecord.idFromPorts(sourcePortId, sinkPortId));
	}
);

export const getConnectionsForSourcePort = createSelector(
	[
		getConnections,
		(state: RootStateType, sourcePortId: GraphConnectionRecord["sourcePortId"]): GraphConnectionRecord["sourcePortId"] => sourcePortId
	],
	(connections, sourcePortId): Seq.Indexed<GraphConnectionRecord> => {
		return connections.filter(conn => conn.sourcePortId === sourcePortId).valueSeq();
	}
);

export const getConnectionsForSinkPort = createSelector(
	[
		getConnections,
		(state: RootStateType, sinkPortId: GraphConnectionRecord["sinkPortId"]): GraphConnectionRecord["sinkPortId"] => sinkPortId
	],
	(connections, sinkPortId): Seq.Indexed<GraphConnectionRecord> => {
		return connections.filter(conn => conn.sinkPortId === sinkPortId).valueSeq();
	}
);
