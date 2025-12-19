import { NodePositionRecord } from "../models/graph";
import { OSCQuerySetMeta } from "./types";

export const serializeSetMeta = (
	nodes: NodePositionRecord[]
): string => {
	const result: OSCQuerySetMeta = { nodes: {} };
	for (const node of nodes) {
		result.nodes[node.id] = { position: { x: node.x, y: node.y } };
	}
	return JSON.stringify(result);
};

export const deserializeSetMeta = (metaString: string): OSCQuerySetMeta => {
	// I don't know why we're getting strings of length 1 but, they can't be valid JSON anyway
	if (metaString && metaString.length > 1) {
		try {
			const meta = JSON.parse(metaString) as OSCQuerySetMeta;
			return meta;
		} catch (err) {
			console.warn(`Failed to parse Set Meta when creating new node: ${err.message}`);
		}
	}
	return { nodes: {} };
};
