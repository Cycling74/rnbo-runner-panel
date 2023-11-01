import { Map as ImmuMap } from "immutable";
import { GraphAction, GraphActionType } from "../actions/graph";
import { GraphConnectionRecord, GraphNodeRecord, GraphPatcherNodeRecord, NodeType } from "../models/graph";
import { MessageOutputRecord } from "../models/messages";

export interface GraphState {

	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>;
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>;
	outportValues: ImmuMap<GraphPatcherNodeRecord["id"], ImmuMap<MessageOutputRecord["id"], string>>,
	patcherNodeIdByIndex: ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord["id"]>;

}

export const graph = (state: GraphState = {

	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>(),
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>(),
	outportValues: ImmuMap<GraphPatcherNodeRecord["id"], ImmuMap<MessageOutputRecord["id"], string>>(),
	patcherNodeIdByIndex: ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord["id"]>()

}, action: GraphAction): GraphState => {

	switch (action.type) {

		case GraphActionType.INIT: {
			const { connections, nodes } = action.payload;

			return {
				...state,
				connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>().withMutations((map) => {
					for (const connection of connections) {
						map.set(connection.id, connection);
					}
				}),
				nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>(nodes.map(n => [n.id, n])),
				outportValues: ImmuMap<GraphPatcherNodeRecord["id"], ImmuMap<MessageOutputRecord["id"], string>>().withMutations((nodeMap) => {
					for (const node of nodes) {
						if (node.type === NodeType.Patcher) {
							const portMap = ImmuMap<MessageOutputRecord["id"], string>().withMutations((map) => {
								for (const port of node.messageOutputs.valueSeq().toArray()) {
									map.set(port.id, "");
								}
							});
							nodeMap.set(node.id, portMap);
						}
					}
				}),
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
				outportValues: state.outportValues.delete(node.id),
				patcherNodeIdByIndex: node.type === NodeType.Patcher ? state.patcherNodeIdByIndex.delete(node.index) : state.patcherNodeIdByIndex,
				connections: state.connections
					.filter(connection => connection.sourceNodeId !== node.id && connection.sinkNodeId !== node.id )
			};
		}

		case GraphActionType.DELETE_NODES: {
			const { nodes } = action.payload;
			const nodeIds = nodes.map(n => n.id);
			return {
				...state,
				nodes: state.nodes.deleteAll(nodeIds),
				outportValues: state.outportValues.deleteAll(nodeIds),
				patcherNodeIdByIndex: state.patcherNodeIdByIndex.deleteAll(
					(nodes.filter(n => n.type === NodeType.Patcher) as GraphPatcherNodeRecord[])
						.map(n => n .index)
				),
				connections: state.connections
					.filter(connection => !nodeIds.includes(connection.sourceNodeId) && !nodeIds.includes(connection.sinkNodeId) )
			};
		}

		case GraphActionType.SET_NODE: {
			const { node } = action.payload;
			return {
				...state,
				nodes: state.nodes.set(node.id, node),
				outportValues: node.type === NodeType.Patcher ? state.outportValues.set(node.id, ImmuMap<MessageOutputRecord["id"], string>().withMutations((map) => {
					for (const port of node.messageOutputs.valueSeq().toArray()) {
						map.set(port.id, "");
					}
				})) : state.outportValues,
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
				outportValues: state.outportValues.withMutations((nodeMap) => {
					for (const node of nodes) {
						if (node.type === NodeType.Patcher) {
							const portMap = ImmuMap<MessageOutputRecord["id"], string>().withMutations((map) => {
								for (const port of node.messageOutputs.valueSeq().toArray()) {
									map.set(port.id, "");
								}
							});
							nodeMap.set(node.id, portMap);
						}
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

		case GraphActionType.SET_OUTPORT_MESSAGE_VALUE: {
			const { nodeId, portId, value } = action.payload;

			const portMap = state.outportValues.get(nodeId);
			if (!portMap) return state;

			return {
				...state,
				outportValues: state.outportValues.set(nodeId, portMap.set(portId, value))
			};
		}

		case GraphActionType.DELETE_CONNECTION: {
			const { connection } = action.payload;

			const nodeConns = state.connections.get(connection.sourceNodeId);
			if (!nodeConns) return state;

			return {
				...state,
				connections: state.connections.delete(connection.id)
			};
		}

		case GraphActionType.DELETE_CONNECTIONS: {
			const { connections } = action.payload;

			return {
				...state,
				connections: state.connections.deleteAll(connections.map(conn => conn.id))
			};
		}

		case GraphActionType.SET_CONNECTION: {
			const { connection } = action.payload;

			return {
				...state,
				connections: state.connections.set(connection.id, connection)
			};
		}

		case GraphActionType.SET_CONNECTIONS: {
			const { connections } = action.payload;

			const newConns = state.connections.withMutations(map => {

				for (const connection of connections) {
					map.set(connection.id, connection);
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
