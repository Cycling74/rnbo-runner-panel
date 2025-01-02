import throttle from "lodash.throttle";
import { Map as ImmuMap } from "immutable";
import { GraphNodeRecord } from "../models/graph";
import { OSCQuerySetMeta } from "../lib/types";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { writePacket } from "osc";
import { AppThunk } from "../lib/store";
import { getNodes } from "../selectors/graph";

export const serializeSetMeta = (nodes: GraphNodeRecord[]): string => {
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
			return JSON.parse(metaString) as OSCQuerySetMeta;
		} catch (err) {
			console.warn(`Failed to parse Set Meta when creating new node: ${err.message}`);
		}
	}
	return { nodes: {} };
};

const doUpdateNodesMeta = throttle((nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>) => {
	try {
		const value = serializeSetMeta(nodes.valueSeq().toArray());

		const message = {
			address: "/rnbo/inst/control/sets/meta",
			args: [
				{ type: "s", value }
			]
		};
		oscQueryBridge.sendPacket(writePacket(message));
	} catch (err) {
		console.warn(`Failed to update Set Meta on remote: ${err.message}`);
	}

}, 150, { leading: true, trailing: true });

export const updateSetMetaOnRemoteFromNodes = (nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>): AppThunk =>
	() => doUpdateNodesMeta(nodes);

export const triggerSetMetaUpdateOnRemote = (): AppThunk =>
	(dispatch, getState) => doUpdateNodesMeta(getNodes(getState()));
