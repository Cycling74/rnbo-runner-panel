import { Map as ImmuMap } from "immutable";
import { GraphAction, GraphActionType } from "../actions/graph";
import { GraphConnectionRecord, GraphNodeRecord, GraphPatcherNodeRecord, GraphPortRecord, NodeType } from "../models/graph";

export interface GraphState {

	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>;
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>;
	patcherNodeIdByInstanceId: ImmuMap<GraphPatcherNodeRecord["instanceId"], GraphPatcherNodeRecord["id"]>;
	portAliases: ImmuMap<GraphPortRecord["portName"], string[]>;

}

export const graph = (state: GraphState = {

	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>(),
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>(),
	patcherNodeIdByInstanceId: ImmuMap<GraphPatcherNodeRecord["instanceId"], GraphPatcherNodeRecord["id"]>(),
	portAliases: ImmuMap<GraphPortRecord["portName"], string[]>()

}, action: GraphAction): GraphState => {

	switch (action.type) {

		case GraphActionType.DELETE_NODE: {
			const { node } = action.payload;
			return {
				...state,
				nodes: state.nodes.delete(node.id),
				patcherNodeIdByInstanceId: node.type === NodeType.Patcher ? state.patcherNodeIdByInstanceId.delete(node.instanceId) : state.patcherNodeIdByInstanceId,
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
				patcherNodeIdByInstanceId: state.patcherNodeIdByInstanceId.deleteAll(
					(nodes.filter(n => n.type === NodeType.Patcher) as GraphPatcherNodeRecord[])
						.map(n => n .instanceId)
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
				patcherNodeIdByInstanceId: node.type === NodeType.Patcher ? state.patcherNodeIdByInstanceId.set(node.instanceId, node.id) : state.patcherNodeIdByInstanceId
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
				patcherNodeIdByInstanceId: state.patcherNodeIdByInstanceId.withMutations(map => {
					for (const node of nodes) {
						if (node.type === NodeType.Patcher) {
							map.set(node.instanceId, node.id);
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

		case GraphActionType.SET_PORT_ALIASES_LIST: {
			const { portName, aliases } = action.payload;
			return {
				...state,
				portAliases: state.portAliases.set(portName, aliases)
			};
		}

		case GraphActionType.SET_PORTS_ALIASES_LIST: {
			const { aliases } = action.payload;
			return {
				...state,
				portAliases: state.portAliases.withMutations(map => {
					for (const { portName, aliases: portAliases } of aliases) {
						map.set(portName, portAliases);
					}
				})
			};
		}

		case GraphActionType.DELETE_PORT_ALIASES_LIST: {
			const { portName } = action.payload;
			return {
				...state,
				portAliases: state.portAliases.delete(portName)
			};
		}

		case GraphActionType.DELETE_PORTS_ALIASES_LIST: {
			const { portNames } = action.payload;
			return {
				...state,
				portAliases: state.portAliases.withMutations(map => {
					for (const portName of portNames) {
						map.delete(portName);
					}
				})
			};
		}

		default:
			return state;
	}
};
