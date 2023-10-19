import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { GraphNodeRecord, GraphPatcherNodeRecord, GraphSystemNodeRecord, NodeType } from "../models/graph";

export const getNode = (state: RootStateType, id: GraphNodeRecord["id"]): GraphNodeRecord | undefined => state.graph.nodes.get(id);
export const getNodeByIndex = (state: RootStateType, index: GraphPatcherNodeRecord["index"]): GraphPatcherNodeRecord | undefined => {
	const id = state.graph.patcherNodeIdByIndex.get(index);
	const node = id ? state.graph.nodes.get(id) : undefined;
	return node as GraphPatcherNodeRecord | undefined;
};

export const getPatcherNodes = (state: RootStateType): ImmuMap<GraphPatcherNodeRecord["id"], GraphPatcherNodeRecord> => {
	return state.graph.nodes.filter(node => node.type === NodeType.Patcher) as ImmuMap<GraphPatcherNodeRecord["id"], GraphPatcherNodeRecord>;
};

export const getPatcherNodesByIndex = (state: RootStateType): ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord> => {
	return ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord>().withMutations(map => {
		state.graph.patcherNodeIdByIndex.forEach((id, index) => {
			const node = getNode(state, id);
			if (node && node.type === NodeType.Patcher) map.set(index, node);
		});
	});
};

export const getSystemNodes = (state: RootStateType): ImmuMap<GraphSystemNodeRecord["id"], GraphSystemNodeRecord> => {
	return state.graph.nodes.filter(node => node.type === NodeType.System) as ImmuMap<GraphSystemNodeRecord["id"], GraphSystemNodeRecord>;
};

export const getConnections = (state: RootStateType): ImmuMap<GraphNodeRecord["id"], ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>> => state.graph.connections;
