import { Map as ImmuMap } from "immutable";
import { GraphAction, GraphActionType } from "../actions/graph";
import { EditorEdgeRecord, EditorNodeRecord } from "../models/editor";
import { GraphNodeRecord, GraphSystemNodeRecord, NodeType } from "../models/graph";
import { EditorAction, EditorActionType } from "../actions/editor";

export interface EditorState {
	edges: ImmuMap<EditorEdgeRecord["id"], EditorEdgeRecord>,
	nodes: ImmuMap<EditorNodeRecord["id"], EditorNodeRecord>;
}

const defaultNodeSpacing = 100;

const getDefaultCoordinates = (graphNode: GraphNodeRecord, editorNode: EditorNodeRecord, nodes: EditorState["nodes"]): { x: number, y: number } => {

	if (graphNode.type === NodeType.Patcher) {

		const existingNode = nodes.find(n => n.id === editorNode.id);
		if (existingNode) return { x: existingNode.x, y: existingNode.y };

		const bottomNode: EditorNodeRecord | undefined = nodes.reduce((n, current) => {
			if (current.type === NodeType.System) return n;
			if (!n && current.type === NodeType.Patcher) return current;
			return current.y > n.y ? current : n;
		}, undefined as EditorNodeRecord | undefined);
		const y = bottomNode ? bottomNode.y + bottomNode.height + defaultNodeSpacing : 0;
		return { x: 0, y };
	}

	return {
		x: (graphNode.id === GraphSystemNodeRecord.systemInputName ? -1 : 1) * (editorNode.width + defaultNodeSpacing * 3),
		y: 0
	};
};

export const editor = (state: EditorState = {

	edges: ImmuMap<EditorEdgeRecord["id"], EditorEdgeRecord>(),
	nodes: ImmuMap<EditorNodeRecord["id"], EditorNodeRecord>()

}, action: GraphAction | EditorAction): EditorState => {

	switch (action.type) {

		// Client-Side Editor Actions
		case EditorActionType.POSITION_NODE: {
			const { id, x, y } = action.payload;
			const node = state.nodes.get(id);
			if (!node) return state;

			return {
				...state,
				nodes: state.nodes.set(node.id, node.updatePosition(x, y))
			};
		}

		case EditorActionType.SELECT_NODE: {
			const { id } = action.payload;
			const node = state.nodes.get(id);
			if (!node) return state;

			return {
				...state,
				nodes: state.nodes.set(node.id, node.select())
			};
		}

		case EditorActionType.UNSELECT_NODE: {
			const { id } = action.payload;
			const node = state.nodes.get(id);
			if (!node) return state;

			return {
				...state,
				nodes: state.nodes.set(node.id, node.unselect())
			};
		}

		case EditorActionType.SELECT_EDGE: {
			const { id } = action.payload;
			const edge = state.edges.get(id);
			if (!edge) return state;

			return {
				...state,
				edges: state.edges.set(edge.id, edge.select())
			};
		}

		case EditorActionType.UNSELECT_EDGE: {
			const { id } = action.payload;
			const edge = state.edges.get(id);
			if (!edge) return state;

			return {
				...state,
				edges: state.edges.set(edge.id, edge.unselect())
			};
		}

		// Device Graph Actions
		case GraphActionType.INIT: {
			const { connections, nodes } = action.payload;

			return {
				...state,
				edges: ImmuMap<EditorEdgeRecord["id"], EditorEdgeRecord>().withMutations(map => {
					for (const connection of connections) {
						const edge = EditorEdgeRecord.create({ id: connection.id });
						map.set(edge.id, edge);
					}
				}),
				nodes: ImmuMap<EditorNodeRecord["id"], EditorNodeRecord>().withMutations(map => {
					for (const node of nodes) {
						const edNode = EditorNodeRecord.create({
							id: node.id,
							type: node.type,
							ports: node.ports
						});

						const { x, y } = getDefaultCoordinates(node, edNode, map);
						map.set(edNode.id, edNode.updatePosition(x, y));
					}
				})
			};
		}

		case GraphActionType.DELETE_NODE: {
			const { node } = action.payload;
			return {
				...state,
				nodes: state.nodes.delete(node.id)
			};
		}

		case GraphActionType.DELETE_NODES: {
			const { nodes } = action.payload;
			const nodeIds = nodes.map(n => n.id);
			return {
				...state,
				nodes: state.nodes.deleteAll(nodeIds)
			};
		}

		case GraphActionType.SET_NODE: {
			const { node } = action.payload;

			const edNode = EditorNodeRecord.create({
				id: node.id,
				type: node.type,
				ports: node.ports
			});
			const { x, y } = getDefaultCoordinates(node, edNode, state.nodes);

			return {
				...state,
				nodes: state.nodes.set(edNode.id, edNode.updatePosition(x, y) )
			};
		}

		case GraphActionType.SET_NODES: {
			const { nodes } = action.payload;

			return {
				...state,
				nodes: state.nodes.withMutations(map => {
					for (const node of nodes) {
						const edNode = EditorNodeRecord.create({
							id: node.id,
							type: node.type,
							ports: node.ports
						});

						const { x, y } = getDefaultCoordinates(node, edNode, map);
						map.set(edNode.id, edNode.updatePosition(x, y));
					}
				})
			};
		}

		case GraphActionType.DELETE_CONNECTION: {
			const { connection } = action.payload;
			return {
				...state,
				edges: state.edges.delete(connection.id)
			};
		}

		case GraphActionType.DELETE_CONNECTIONS: {
			const { connections } = action.payload;
			const edgeIds = connections.map(c => c.id);
			return {
				...state,
				edges: state.edges.deleteAll(edgeIds)
			};
		}

		case GraphActionType.SET_CONNECTION: {
			const { connection } = action.payload;

			const edge = EditorEdgeRecord.create({ id: connection.id });
			return {
				...state,
				edges: state.edges.set(edge.id, edge)
			};
		}

		case GraphActionType.SET_CONNECTIONS: {
			const { connections } = action.payload;

			return {
				...state,
				edges: state.edges.withMutations(map => {
					for (const connection of connections) {
						const edge = EditorEdgeRecord.create({ id: connection.id });
						map.set(edge.id, edge);
					}
				})
			};
		}

		default:
			return state;
	}
};
