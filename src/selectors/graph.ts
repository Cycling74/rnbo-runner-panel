import { Map as ImmuMap, Seq, Set as ImmuSet } from "immutable";
import { RootStateType } from "../lib/store";
import { GraphConnectionRecord, GraphControlNodeRecord, GraphNodeRecord, GraphPatcherNodeRecord, GraphPortRecord, GraphSystemNodeRecord, NodeType, PortDirection } from "../models/graph";
import { createSelector } from "reselect";

export const getHasStoredGraphPositionData = (state: RootStateType): boolean => state.graph.hasRemoteMeta;

export const getNodes = (state: RootStateType): ImmuMap<GraphNodeRecord["id"], GraphNodeRecord> => state.graph.nodes;
export const getPatcherNodeIdsByInstanceId = (state: RootStateType): ImmuMap<GraphPatcherNodeRecord["instanceId"], GraphPatcherNodeRecord["id"]> => state.graph.patcherNodeIdByInstanceId;

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
	(nodes): ImmuMap<GraphPatcherNodeRecord["id"], GraphPatcherNodeRecord> => {
		return nodes.filter(node => node.type === NodeType.Patcher) as ImmuMap<GraphPatcherNodeRecord["id"], GraphPatcherNodeRecord>;
	}
);

export const getPatcherNodeByInstanceId = createSelector(
	[
		getNodes,
		getPatcherNodeIdsByInstanceId,
		(state: RootStateType, instanceId: GraphPatcherNodeRecord["instanceId"]): GraphPatcherNodeRecord["instanceId"] => instanceId
	],
	(nodes, idsByInstanceId, instanceId): GraphPatcherNodeRecord | undefined => {
		const id = idsByInstanceId.get(instanceId);
		const node = id ? nodes.get(id) : undefined;
		return node as GraphPatcherNodeRecord | undefined;
	}
);

export const getFirstPatcherNodeId = createSelector(
	[
		getPatcherNodeIdsByInstanceId
	],
	(idsByInstanceId): string | undefined => {
		return idsByInstanceId.size === 0 ? undefined : idsByInstanceId.keySeq().sort().first();
	}
);

export const getPatcherNodesByInstanceId = (state: RootStateType): ImmuMap<GraphPatcherNodeRecord["instanceId"], GraphPatcherNodeRecord> => {
	return ImmuMap<GraphPatcherNodeRecord["instanceId"], GraphPatcherNodeRecord>().withMutations(map => {
		state.graph.patcherNodeIdByInstanceId.forEach((nodeId, instanceId) => {
			const node = getNode(state, nodeId);
			if (node && node.type === NodeType.Patcher) map.set(instanceId, node);
		});
	});
};

export const getControlNodes = createSelector(
	[getNodes],
	(nodes): ImmuMap<GraphControlNodeRecord["id"], GraphControlNodeRecord> => {
		return nodes.filter(node => node.type === NodeType.Control) as ImmuMap<GraphControlNodeRecord["id"], GraphControlNodeRecord>;
	}
);

export const getControlsNodesJackNames = createSelector(
	[getNodes],
	(nodes) :ImmuSet<GraphControlNodeRecord["jackName"]> => {
		return ImmuSet<GraphControlNodeRecord["jackName"]>().withMutations(result => {
			for (const node of nodes.valueSeq().toArray()) {
				if (node.type === NodeType.Control) result.add(node.jackName);
			}
		});
	}
);

export const getSystemNodes = createSelector(
	[getNodes],
	(nodes):  ImmuMap<GraphSystemNodeRecord["id"], GraphSystemNodeRecord> => {
		return nodes.filter(node => node.type === NodeType.System) as ImmuMap<GraphSystemNodeRecord["id"], GraphSystemNodeRecord>;
	}
);

export const getSystemNodeByJackNameAndDirection = createSelector(
	[
		getNodes,
		(state: RootStateType, jackName: GraphSystemNodeRecord["jackName"]): GraphSystemNodeRecord["jackName"] => jackName,
		(state: RootStateType, jackName: GraphSystemNodeRecord["jackName"], direction: PortDirection): PortDirection => direction
	],
	(nodes, jackName, direction): GraphSystemNodeRecord | undefined => {
		return nodes.find(node => node.type === NodeType.System && node.jackName === jackName && node.direction === direction) as GraphSystemNodeRecord | undefined;
	}
);

export const getSystemNodesJackNames = createSelector(
	[getNodes],
	(nodes): ImmuSet<GraphSystemNodeRecord["jackName"]> => {
		return ImmuSet<GraphSystemNodeRecord["jackName"]>().withMutations(result => {
			for (const node of nodes.valueSeq().toArray()) {
				if (node.type === NodeType.System) result.add(node.jackName);
			}
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

export type NodeAndPortDesc = {
	sourceNodeId: string;
	sourcePortId: string;
	sinkNodeId: string;
	sinkPortId: string;
};

export const getConnectionByNodesAndPorts = createSelector(
	[
		getConnections,
		(state: RootStateType, desc: NodeAndPortDesc): NodeAndPortDesc => desc
	],
	(connections, { sourceNodeId, sourcePortId, sinkNodeId, sinkPortId }): GraphConnectionRecord | undefined => {
		return connections.get(GraphConnectionRecord.idFromNodesAndPorts(sourceNodeId, sourcePortId, sinkNodeId, sinkPortId));
	}
);

export const getConnectionsForSourceNodeAndPort = createSelector(
	[
		getConnections,
		(state: RootStateType, desc: Pick<NodeAndPortDesc, "sourceNodeId" | "sourcePortId">): Pick<NodeAndPortDesc, "sourceNodeId" | "sourcePortId"> => desc
	],
	(connections, { sourceNodeId, sourcePortId }): Seq.Indexed<GraphConnectionRecord> => {
		return connections.filter(conn => conn.sourceNodeId === sourceNodeId && conn.sourcePortId === sourcePortId).valueSeq();
	}
);


export const getConnectionsForSinkNodeAndPort = createSelector(
	[
		getConnections,
		(state: RootStateType, desc: Pick<NodeAndPortDesc, "sinkNodeId" | "sinkPortId">): Pick<NodeAndPortDesc, "sinkNodeId" | "sinkPortId"> => desc
	],
	(connections, { sinkNodeId, sinkPortId }): Seq.Indexed<GraphConnectionRecord> => {
		return connections.filter(conn => conn.sinkNodeId === sinkNodeId && conn.sinkPortId === sinkPortId).valueSeq();
	}
);

export const getPortAliases = (state: RootStateType): ImmuMap<GraphPortRecord["portName"], string[]> => state.graph.portAliases;

export const getPortAlias = createSelector(
	[
		getPortAliases,
		(state: RootStateType, portName: GraphPortRecord["portName"]): GraphPortRecord["portName"] => portName
	],
	(aliases, portName): string | undefined => {
		// For now we only alias system node ports
		return portName.startsWith("system")
			? aliases.get(portName)?.[0] || undefined
			: undefined;
	}
);

export const getPortAliasesForNode = createSelector(
	[
		getPortAliases,
		(state: RootStateType, node: GraphNodeRecord): GraphNodeRecord => node
	],
	(aliases, node): ImmuMap<GraphPortRecord["portName"], string> => {
		return ImmuMap<GraphPortRecord["portName"], string>().withMutations(map => {
			node.ports.valueSeq().forEach(port => {
				const alias = aliases.get(port.portName);
				if (alias?.length) {
					map.set(port.portName, alias[0]);
				}
			});
		});
	}
);
