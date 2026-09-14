import { createSelector } from "reselect";
import { RootStateType } from "../lib/store";
import { NodeType, PortDirection } from "../models/graph";
import { getFirstPatcherNodeInstanceId, getNodes, getPorts } from "./graph";
import { getLinkAudioSinkOrder, getLinkAudioSourceOrder } from "./linkAudio";
import { linkDevicePath, patcherDevicePath } from "../lib/deviceRoutes";

export enum LinkDeviceKind {
	// audio arriving from a Link peer — one device per peer
	Receive = "receive",
	// audio we announce to the session — a single device holding every Send
	Send = "send"
}

export type LinkDeviceDesc = {
	// the JACK port group, which is also the graph node id: "Link: <peer>" or "Link: Sends"
	nodeId: string;
	kind: LinkDeviceKind;
	label: string;
	// jack_transport_link slot keys, in the order the server publishes them
	slotKeys: string[];
};

const collator = new Intl.Collator("en-US", { numeric: true });

// Group the Link Audio graph nodes into "devices". A node's slots are found through the
// link/audio/slot property its ports carry — never by parsing the port group, which is a display
// string. Direction decides which key space a slot key belongs to: jack_transport_link registers
// a Send as a JACK input and a Receive as a JACK output, and the two key spaces are separate.
export const getLinkDevices = createSelector(
	[
		getNodes,
		getPorts,
		getLinkAudioSourceOrder,
		getLinkAudioSinkOrder
	],
	(nodes, ports, sourceOrder, sinkOrder): LinkDeviceDesc[] => {

		const devices: LinkDeviceDesc[] = [];

		nodes.forEach(node => {
			if (node.type !== NodeType.LinkAudio) return;

			const keys = new Set<string>();
			let sinkPorts = 0;
			let sourcePorts = 0;

			ports.forEach(port => {
				if (port.nodeId !== node.id) return;
				const slot = port.linkAudioSlot;
				if (slot === undefined) return;
				keys.add(slot);
				if (port.direction === PortDirection.Sink) sinkPorts++; else sourcePorts++;
			});

			if (!keys.size) return;

			// A group holds one kind or the other; count rather than sample a single port so a
			// mixed group (which jtl never produces) still resolves to its majority instead of
			// whichever port happened to arrive first.
			const kind = sinkPorts > sourcePorts ? LinkDeviceKind.Send : LinkDeviceKind.Receive;
			const order = kind === LinkDeviceKind.Send ? sinkOrder : sourceOrder;

			devices.push({
				nodeId: node.id,
				kind,
				label: node.id,
				// follow the server's order, then append anything not in it yet (a slot whose
				// ports have arrived but whose order update hasn't)
				slotKeys: [
					...order.filter(k => keys.has(k)),
					...Array.from(keys).filter(k => !order.includes(k)).sort(collator.compare)
				]
			});
		});

		// Sends last, then peers alphabetically, so the device list has a stable shape
		return devices.sort((a, b) => {
			if (a.kind !== b.kind) return a.kind === LinkDeviceKind.Send ? 1 : -1;
			return collator.compare(a.label, b.label);
		});
	}
);

export const getLinkDevice = createSelector(
	[
		getLinkDevices,
		(state: RootStateType, nodeId: string): string => nodeId
	],
	(devices, nodeId): LinkDeviceDesc | undefined => devices.find(d => d.nodeId === nodeId)
);

// Where the nav's "Devices" entry points. Patcher instances win when there are any; a graph with
// only Link nodes still gets a reachable Devices pane. Undefined disables the nav entry.
export const getFirstDevicePath = createSelector(
	[
		getFirstPatcherNodeInstanceId,
		getLinkDevices
	],
	(instanceId, linkDevices): string | undefined => {
		if (instanceId !== undefined) return patcherDevicePath(instanceId);
		return linkDevices.length ? linkDevicePath(linkDevices[0].nodeId) : undefined;
	}
);
