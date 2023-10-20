import { Map as ImmuMap } from "immutable";
import { GraphAction, GraphActionType } from "../actions/graph";
import { EditorNodeRecord, EditorNodeBaseHeight } from "../models/editor";
import { GraphNodeRecord, GraphSystemNodeRecord, NodeType } from "../models/graph";

export interface EditorState {
	nodes: ImmuMap<EditorNodeRecord["id"], EditorNodeRecord>;
}

const getDefaultCoordinatesForNode = (node: GraphNodeRecord): { x: number, y: number } => {

	if (node.type === NodeType.Patcher) {
		return { x: 0, y: node.index * EditorNodeBaseHeight };
	}

	if (node.type === NodeType.System && node.id === GraphSystemNodeRecord.systemInputName) {
		return {
			x: -Math.round(window.innerWidth / 2),
			y: 0
		};
	}

	return {
		x: Math.round(window.innerWidth / 2),
		y: 0
	};
};

export const editor = (state: EditorState = {

	nodes: ImmuMap<EditorNodeRecord["id"], EditorNodeRecord>()

}, action: GraphAction): EditorState => {

	switch (action.type) {

		case GraphActionType.INIT: {
			const { nodes } = action.payload;

			return {
				...state,
				nodes: ImmuMap<EditorNodeRecord["id"], EditorNodeRecord>().withMutations(map => {
					for (let i = 0; i < nodes.length; i++) {
						const node = nodes[i];
						if (node.type === NodeType.System && node.id === GraphSystemNodeRecord.systemInputName) {
							map.set(
								node.id,
								EditorNodeRecord.create({
									id: node.id,
									type: node.type,
									...getDefaultCoordinatesForNode(node)
								})
							);
						} else if (node.type === NodeType.System && node.id === GraphSystemNodeRecord.systemOutputName) {
							map.set(
								node.id,
								EditorNodeRecord.create({
									id: node.id,
									type: node.type,
									...getDefaultCoordinatesForNode(node)
								})
							);
						} else if (node.type === NodeType.Patcher) {
							map.set(
								node.id,
								EditorNodeRecord.create({
									id: node.id,
									type: node.type,
									...getDefaultCoordinatesForNode(node)
								})
							);
						}
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
			return {
				...state,
				nodes: state.nodes.set(node.id, EditorNodeRecord.create({
					id: node.id,
					type: node.type,
					...getDefaultCoordinatesForNode(node)
				}))
			};
		}

		case GraphActionType.SET_NODES: {
			const { nodes } = action.payload;
			return {
				...state,
				nodes: state.nodes.withMutations(map => {
					for (const node of nodes) {
						map.set(node.id, EditorNodeRecord.create({
							id: node.id,
							type: node.type,
							...getDefaultCoordinatesForNode(node)
						}));
					}
				})
			};
		}

		default:
			return state;
	}
};
