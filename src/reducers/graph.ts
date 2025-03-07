import { Map as ImmuMap } from "immutable";
import { GraphAction, GraphActionType } from "../actions/graph";
import { GraphConnectionRecord, GraphNodeRecord, GraphPortRecord, NodePositionRecord, NodeType } from "../models/graph";

export interface GraphState {
	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>;
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>;
	nodePositions: ImmuMap<NodePositionRecord["id"], NodePositionRecord>;
	patcherNodeIdByInstanceId: ImmuMap<GraphNodeRecord["instanceId"], GraphNodeRecord["id"]>;
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>;
}

export const graph = (state: GraphState = {

	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>(),
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>(),
	nodePositions: ImmuMap<NodePositionRecord["id"], NodePositionRecord>(),
	patcherNodeIdByInstanceId: ImmuMap<GraphNodeRecord["instanceId"], GraphNodeRecord["id"]>(),
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>()

}, action: GraphAction): GraphState => {

	switch (action.type) {

		case GraphActionType.DELETE_NODE: {
			const { node } = action.payload;
			const portIds = state.ports.filter(p => p.nodeId === node.id).keySeq().toArray();

			return {
				...state,
				nodes: state.nodes.delete(node.id),
				ports: state.ports.filter(p => p.nodeId !== node.id),
				patcherNodeIdByInstanceId: node.type === NodeType.Patcher ? state.patcherNodeIdByInstanceId.delete(node.instanceId) : state.patcherNodeIdByInstanceId,
				connections: state.connections
					.filter(connection => !portIds.includes(connection.sourcePortId)  && !portIds.includes(connection.sinkPortId))
			};
		}

		case GraphActionType.DELETE_NODES: {
			const { nodes } = action.payload;

			const nodeIds = nodes.map(n => n.id);
			const portIds = state.ports.filter(p => nodeIds.includes(p.nodeId)).keySeq().toArray();

			return {
				...state,
				nodes: state.nodes.deleteAll(nodeIds),
				ports: state.ports
					.filter(p => !nodeIds.includes(p.nodeId)),
				patcherNodeIdByInstanceId: state.patcherNodeIdByInstanceId.deleteAll(
					nodes.filter(n => n.type === NodeType.Patcher && n.instanceId !== undefined).map(n => n .instanceId)
				),
				connections: state.connections
					.filter(connection => !portIds.includes(connection.sourcePortId) && !portIds.includes(connection.sinkPortId) )
			};
		}

		case GraphActionType.SET_NODE: {
			const { node } = action.payload;
			return {
				...state,
				nodes: state.nodes.set(node.id, node),
				patcherNodeIdByInstanceId: node.type === NodeType.Patcher && node.instanceId !== undefined ? state.patcherNodeIdByInstanceId.set(node.instanceId, node.id) : state.patcherNodeIdByInstanceId
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
						if (node.type === NodeType.Patcher && node.instanceId !== undefined) {
							map.set(node.instanceId, node.id);
						}
					}
				})
			};
		}

		case GraphActionType.SET_NODE_POSITION: {
			const { position } = action.payload;
			return {
				...state,
				nodePositions: state.nodePositions.set(position.id, position)
			};
		}

		case GraphActionType.SET_NODE_POSITIONS: {
			const { positions } = action.payload;
			return {
				...state,
				nodePositions: state.nodePositions.withMutations(map => {
					for (const position of positions) {
						map.set(position.id, position);
					}
				})
			};
		}

		case GraphActionType.DELETE_NODE_POSITION: {
			const { position } = action.payload;
			return {
				...state,
				nodePositions: state.nodePositions.delete(position.id)
			};
		}

		case GraphActionType.DELETE_NODE_POSITIONS: {
			const { positions } = action.payload;
			const posIds = positions.map(p => p.id);

			return {
				...state,
				nodePositions: state.nodePositions.deleteAll(posIds)
			};
		}

		case GraphActionType.DELETE_CONNECTION: {
			const { connection } = action.payload;

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

		case GraphActionType.SET_PORT: {
			const { port } = action.payload;
			return {
				...state,
				ports: state.ports.set(port.id, port)
			};
		}

		case GraphActionType.SET_PORTS: {
			const { ports } = action.payload;
			return {
				...state,
				ports: state.ports.withMutations(map => {
					for (const port of ports) {
						map.set(port.id, port);
					}
				})
			};
		}

		case GraphActionType.DELETE_PORT: {
			const { port } = action.payload;

			const newPorts = state.ports.delete(port.id);
			const remainingPortCount = newPorts.filter(p => p.nodeId === port.nodeId).size;

			return {
				...state,
				ports: newPorts,
				nodes: remainingPortCount === 0 ? state.nodes.delete(port.nodeId) : state.nodes,
				connections: state.connections.filter(c => c.sinkPortId !== port.id && c.sourcePortId !== port.id)
			};
		}

		case GraphActionType.DELETE_PORTS: {
			const { ports } = action.payload;

			const portIds = ports.map(p => p.id);
			const newPorts = state.ports.deleteAll(portIds);
			let newNodes = state.nodes;

			for (const port of ports) {
				const remainingPortCount = newPorts.filter(p => p.nodeId === port.nodeId).size;
				newNodes = remainingPortCount === 0 ? newNodes.delete(port.nodeId) : newNodes;
			}

			return {
				...state,
				ports: newPorts,
				nodes: newNodes,
				connections: state.connections
					.filter(connection => !portIds.includes(connection.sourcePortId) && !portIds.includes(connection.sinkPortId) )
			};
		}

		default:
			return state;
	}
};
