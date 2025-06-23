import debounce from "lodash.debounce";
import { Map as ImmuMap } from "immutable";
import { GraphNodeRecord, NodePositionRecord } from "../models/graph";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { writePacket } from "osc";
import { AppThunk } from "../lib/store";
import { getNodePositions, getNodes } from "../selectors/graph";
import { serializeSetMeta } from "../lib/meta";

const doUpdateNodesMeta = debounce((nodes: GraphNodeRecord[], positions: ImmuMap<NodePositionRecord["id"], NodePositionRecord>) => {
	try {
		const relevantPos = nodes.reduce((result, node) => {
			const pos = positions.get(node.id);
			if (pos) result.push(pos);
			return result;
		}, [] as NodePositionRecord[]);

		const value = serializeSetMeta(relevantPos);
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

}, 150, { leading: false, trailing: true });

export const updateSetMetaOnRemoteFromNodes = (nodes: GraphNodeRecord[]): AppThunk =>
	(dispatch, getState) => {
		doUpdateNodesMeta(
			nodes,
			getNodePositions(getState())
		);
	};

export const triggerSetMetaUpdateOnRemote = (): AppThunk =>
	(dispatch, getState) => {
		const state = getState();
		doUpdateNodesMeta(
			getNodes(state).valueSeq().toArray(),
			getNodePositions(state)
		);
	};
