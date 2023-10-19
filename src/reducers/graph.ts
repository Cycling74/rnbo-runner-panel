import { Map as ImmuMap } from "immutable";
import { GraphAction, GraphActionType } from "../actions/graph";
import { GraphConnectionRecord, GraphNodeRecord, GraphPatcherNodeRecord, NodeType } from "../models/graph";

export interface GraphState {

	connections: ImmuMap<GraphNodeRecord["id"], ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>>;
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>;
	patcherNodeIdByIndex: ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord["id"]>;

}

export const graph = (state: GraphState = {

	connections: ImmuMap<GraphNodeRecord["id"], ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>>(),
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>(),
	patcherNodeIdByIndex: ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord["id"]>()

}, action: GraphAction): GraphState => {

	switch (action.type) {

		case GraphActionType.INIT: {
			const { connections, nodes } = action.payload;

			return {
				...state,
				connections: ImmuMap<GraphNodeRecord["id"], ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>>().withMutations((map) => {
					for (const connection of connections) {
						const nodeConnections = map.get(connection.sourceNodeId) || ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>();
						map.set(
							connection.sourceNodeId,
							nodeConnections.set(connection.id, connection)
						);
					}
				}),
				nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>(nodes.map(n => [n.id, n])),
				patcherNodeIdByIndex: ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord["id"]>().withMutations((map) => {
					for (const node of nodes) {
						if (node.type === NodeType.Patcher) {
							map.set(node.index, node.id);
						}
					}
				})
			};
		}

		case GraphActionType.DELETE_NODE: {
			const { node } = action.payload;
			return {
				...state,
				nodes: state.nodes.delete(node.id),
				patcherNodeIdByIndex: node.type === NodeType.Patcher ? state.patcherNodeIdByIndex.delete(node.index) : state.patcherNodeIdByIndex,
				connections: state.connections
					// Delete Source Node index
					.delete(node.id)
					// Delete Sink Node entries
					.map(nodeConnMap => nodeConnMap.filter(connNode => connNode.sinkNodeId !== node.id))
			};
		}

		case GraphActionType.DELETE_NODES: {
			const { nodes } = action.payload;
			const nodeIds = nodes.map(n => n.id);
			return {
				...state,
				nodes: state.nodes.deleteAll(nodeIds),
				patcherNodeIdByIndex: state.patcherNodeIdByIndex.deleteAll(
					(nodes.filter(n => n.type === NodeType.Patcher) as GraphPatcherNodeRecord[])
						.map(n => n .index)
				),
				connections: state.connections
					// Delete Source Node indices
					.deleteAll(nodeIds)
					// Delete Sink Node entries
					.map(nodeConnMap => nodeConnMap.filter(connNode => !nodeIds.includes(connNode.sinkNodeId)))
			};
		}

		case GraphActionType.SET_NODE: {
			const { node } = action.payload;
			return {
				...state,
				nodes: state.nodes.set(node.id, node),
				patcherNodeIdByIndex: node.type === NodeType.Patcher ? state.patcherNodeIdByIndex.set(node.index, node.id) : state.patcherNodeIdByIndex
			};
		}

		case GraphActionType.SET_NODES: {
			const { nodes } = action.payload;
			return {
				...state,
				nodes: state.nodes.withMutations(map => {
					for (const node of nodes) {
						map.set(node.id, node);
					}
				}),
				patcherNodeIdByIndex: state.patcherNodeIdByIndex.withMutations(map => {
					for (const node of nodes) {
						if (node.type === NodeType.Patcher) {
							map.set(node.index, node.id);
						}
					}
				})
			};
		}

		case GraphActionType.DELETE_CONNECTION: {
			const { connection } = action.payload;

			const nodeConns = state.connections.get(connection.sourceNodeId);
			if (!nodeConns) return state;

			return {
				...state,
				connections: state.connections.set(
					connection.sourceNodeId,
					nodeConns.delete(connection.id)
				)
			};
		}

		case GraphActionType.DELETE_CONNECTIONS: {
			const { connections } = action.payload;

			const newConns = state.connections.withMutations(map => {
				for (const connection of connections) {
					const nodeConns = map.get(connection.sourceNodeId);
					if (!nodeConns) continue;
					map.set(connection.sourceNodeId, nodeConns.delete(connection.id));
				}
			});

			return {
				...state,
				connections: newConns
			};
		}

		case GraphActionType.SET_CONNECTION: {
			const { connection } = action.payload;

			const nodeConns = state.connections.get(connection.sourceNodeId) || ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>();

			return {
				...state,
				connections: state.connections.set(
					connection.sourceNodeId,
					nodeConns.set(connection.id, connection)
				)
			};
		}

		case GraphActionType.SET_CONNECTIONS: {
			const { connections } = action.payload;

			const newConns = state.connections.withMutations(map => {
				for (const connection of connections) {
					const nodeConns = map.get(connection.sourceNodeId) || ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>();
					if (!nodeConns) continue;
					map.set(connection.sourceNodeId, nodeConns.set(connection.id, connection));
				}
			});

			return {
				...state,
				connections: newConns
			};
		}

		default:
			return state;
	}
};
