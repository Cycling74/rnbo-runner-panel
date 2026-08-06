import { writePacket } from "osc/dist/osc-browser";
import { OrderedMap as ImmuOrderedMap } from "immutable";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOJackLinkAudio, OSCQueryValueType } from "../lib/types";
import {
	LinkAudioPeerInfo,
	LinkAudioSinkRecord,
	LinkAudioSourceRecord,
	parseLinkAudioChannels
} from "../models/linkAudio";

export enum LinkAudioActionType {
	INIT = "INIT_LINK_AUDIO",
	SET_AVAILABLE = "SET_LINK_AUDIO_AVAILABLE",
	SET_PEERS = "SET_LINK_AUDIO_PEERS",
	SET_PEER_NAME = "SET_LINK_AUDIO_PEER_NAME",
	SET_SOURCE_ORDER = "SET_LINK_AUDIO_SOURCE_ORDER",
	SET_SINK_ORDER = "SET_LINK_AUDIO_SINK_ORDER",
	SET_LATENCY_MS = "SET_LINK_AUDIO_LATENCY_MS",
	SET_SYNC_TO_INCOMING = "SET_LINK_AUDIO_SYNC_TO_INCOMING",
	SET_LINK_ENABLED = "SET_LINK_ENABLED",
	UPDATE_SOURCE = "UPDATE_LINK_AUDIO_SOURCE",
	UPDATE_SINK = "UPDATE_LINK_AUDIO_SINK"
}

export interface IInitLinkAudio extends ActionBase {
	type: LinkAudioActionType.INIT;
	payload: {
		available: boolean;
		peers: LinkAudioPeerInfo[];
		peerName: string;
		latencyMs: number;
		syncToIncoming: boolean;
		sourceOrder: string[];
		sinkOrder: string[];
		sources: ImmuOrderedMap<string, LinkAudioSourceRecord>;
		sinks: ImmuOrderedMap<string, LinkAudioSinkRecord>;
	};
}

export interface ISetLinkAudioAvailable extends ActionBase {
	type: LinkAudioActionType.SET_AVAILABLE;
	payload: { available: boolean; };
}

export interface ISetLinkAudioPeerName extends ActionBase {
	type: LinkAudioActionType.SET_PEER_NAME;
	payload: { peerName: string; };
}

export interface ISetLinkAudioPeers extends ActionBase {
	type: LinkAudioActionType.SET_PEERS;
	payload: { peers: LinkAudioPeerInfo[]; };
}

export interface ISetLinkAudioSourceOrder extends ActionBase {
	type: LinkAudioActionType.SET_SOURCE_ORDER;
	payload: { order: string[]; };
}

export interface ISetLinkAudioSinkOrder extends ActionBase {
	type: LinkAudioActionType.SET_SINK_ORDER;
	payload: { order: string[]; };
}

export interface ISetLinkAudioLatencyMs extends ActionBase {
	type: LinkAudioActionType.SET_LATENCY_MS;
	payload: { latencyMs: number; };
}

export interface ISetLinkAudioSyncToIncoming extends ActionBase {
	type: LinkAudioActionType.SET_SYNC_TO_INCOMING;
	payload: { syncToIncoming: boolean; };
}

export interface ISetLinkEnabled extends ActionBase {
	type: LinkAudioActionType.SET_LINK_ENABLED;
	payload: { linkEnabled: boolean; };
}

export interface IUpdateLinkAudioSource extends ActionBase {
	type: LinkAudioActionType.UPDATE_SOURCE;
	payload: { key: string; changes: Partial<{ peer: string; channel: string; connected: boolean; receiving: boolean; bufferedMs: number; dropouts: number; arrivalOffsetMs: number; jitterMs: number; }>; };
}

export interface IUpdateLinkAudioSink extends ActionBase {
	type: LinkAudioActionType.UPDATE_SINK;
	payload: { key: string; changes: Partial<{ name: string; }>; };
}

export type LinkAudioAction = IInitLinkAudio | ISetLinkAudioAvailable | ISetLinkAudioPeers
| ISetLinkAudioPeerName | ISetLinkAudioSourceOrder | ISetLinkAudioSinkOrder | ISetLinkAudioLatencyMs
| ISetLinkAudioSyncToIncoming | ISetLinkEnabled | IUpdateLinkAudioSource | IUpdateLinkAudioSink;

const oscLinkAudioPrefix = "/rnbo/jack/link/audio";

// Slot child nodes are named after the slot key: exactly 12 lowercase hex chars. Matching the
// length matters — it's what keeps the sibling command nodes ("add" is all hex digits) out.
const isSlotKey = (key: string): boolean => /^[0-9a-f]{12}$/.test(key);

const asStringList = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter(v => typeof v === "string") as string[] : [];

export const initLinkAudio = (info?: OSCQueryRNBOJackLinkAudio): LinkAudioAction => {
	const available = info?.CONTENTS?.available?.TYPE === OSCQueryValueType.True;
	const peers = parseLinkAudioChannels(info?.CONTENTS?.channels?.VALUE as string | undefined);
	const peerName = (info?.CONTENTS?.peer_name?.VALUE as string | undefined) || "";
	const latencyMs = (info?.CONTENTS?.latency_ms?.VALUE as number | undefined) ?? 100;
	const syncToIncoming = info?.CONTENTS?.sync_to_incoming?.TYPE === OSCQueryValueType.True;

	const sourcesContents: Record<string, any> = info?.CONTENTS?.sources?.CONTENTS || {};
	const sinksContents: Record<string, any> = info?.CONTENTS?.sinks?.CONTENTS || {};

	// Display order is server-authoritative: the `order` param carries the slot keys in order.
	const sourceOrder = asStringList((sourcesContents.order as { VALUE?: unknown } | undefined)?.VALUE);
	const sinkOrder = asStringList((sinksContents.order as { VALUE?: unknown } | undefined)?.VALUE);

	let sources = ImmuOrderedMap<string, LinkAudioSourceRecord>();
	Object.keys(sourcesContents).filter(isSlotKey).forEach(key => {
		const slot = sourcesContents[key];
		sources = sources.set(key, new LinkAudioSourceRecord({
			key,
			peer: (slot?.CONTENTS?.peer?.VALUE as string | undefined) || "",
			channel: (slot?.CONTENTS?.channel?.VALUE as string | undefined) || "",
			connected: slot?.CONTENTS?.connected?.TYPE === OSCQueryValueType.True,
			receiving: slot?.CONTENTS?.receiving?.TYPE === OSCQueryValueType.True,
			bufferedMs: (slot?.CONTENTS?.buffered_ms?.VALUE as number | undefined) ?? 0,
			dropouts: (slot?.CONTENTS?.dropouts?.VALUE as number | undefined) ?? 0,
			arrivalOffsetMs: (slot?.CONTENTS?.arrival_offset_ms?.VALUE as number | undefined) ?? 0,
			jitterMs: (slot?.CONTENTS?.jitter_ms?.VALUE as number | undefined) ?? 0
		}));
	});

	let sinks = ImmuOrderedMap<string, LinkAudioSinkRecord>();
	Object.keys(sinksContents).filter(isSlotKey).forEach(key => {
		const slot = sinksContents[key];
		sinks = sinks.set(key, new LinkAudioSinkRecord({
			key,
			name: (slot?.CONTENTS?.name?.VALUE as string | undefined) || ""
		}));
	});

	return {
		type: LinkAudioActionType.INIT,
		payload: { available, peers, peerName, latencyMs, syncToIncoming, sourceOrder, sinkOrder, sources, sinks }
	};
};

export const setLinkAudioAvailable = (available: boolean): LinkAudioAction => ({
	type: LinkAudioActionType.SET_AVAILABLE,
	payload: { available }
});

export const setLinkAudioPeers = (channelsJson: string): LinkAudioAction => ({
	type: LinkAudioActionType.SET_PEERS,
	payload: { peers: parseLinkAudioChannels(channelsJson) }
});

export const setLinkAudioPeerName = (peerName: string): LinkAudioAction => ({
	type: LinkAudioActionType.SET_PEER_NAME,
	payload: { peerName }
});

export const setLinkAudioSourceOrder = (order: string[]): LinkAudioAction => ({
	type: LinkAudioActionType.SET_SOURCE_ORDER,
	payload: { order }
});

export const setLinkAudioSinkOrder = (order: string[]): LinkAudioAction => ({
	type: LinkAudioActionType.SET_SINK_ORDER,
	payload: { order }
});

export const setLinkAudioLatencyMs = (latencyMs: number): LinkAudioAction => ({
	type: LinkAudioActionType.SET_LATENCY_MS,
	payload: { latencyMs }
});

export const setLinkAudioSyncToIncoming = (syncToIncoming: boolean): LinkAudioAction => ({
	type: LinkAudioActionType.SET_SYNC_TO_INCOMING,
	payload: { syncToIncoming }
});

export const setLinkEnabled = (linkEnabled: boolean): LinkAudioAction => ({
	type: LinkAudioActionType.SET_LINK_ENABLED,
	payload: { linkEnabled }
});

export const updateLinkAudioSource = (key: string, changes: IUpdateLinkAudioSource["payload"]["changes"]): LinkAudioAction => ({
	type: LinkAudioActionType.UPDATE_SOURCE,
	payload: { key, changes }
});

export const updateLinkAudioSink = (key: string, changes: IUpdateLinkAudioSink["payload"]["changes"]): LinkAudioAction => ({
	type: LinkAudioActionType.UPDATE_SINK,
	payload: { key, changes }
});

// Remote writes (drive the OSCQuery params; jack_transport_link persists everything).
// add/remove address a slot by identity so a client never needs to know a slot key; order
// addresses them by key, since that's what the slot nodes are named.

export const addLinkAudioSourceOnRemote = (peer: string, channel: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sources/add`,
			args: [
				{ type: "s", value: peer },
				{ type: "s", value: channel }
			]
		}));
	};

export const removeLinkAudioSourceOnRemote = (peer: string, channel: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sources/remove`,
			args: [
				{ type: "s", value: peer },
				{ type: "s", value: channel }
			]
		}));
	};

export const setLinkAudioSourceOrderOnRemote = (keys: string[]): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sources/order`,
			args: keys.map(key => ({ type: "s", value: key }))
		}));
	};

export const addLinkAudioSinkOnRemote = (name: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sinks/add`,
			args: [{ type: "s", value: name }]
		}));
	};

export const removeLinkAudioSinkOnRemote = (name: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sinks/remove`,
			args: [{ type: "s", value: name }]
		}));
	};

export const setLinkAudioSinkOrderOnRemote = (keys: string[]): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sinks/order`,
			args: keys.map(key => ({ type: "s", value: key }))
		}));
	};

export const setLinkAudioPeerNameOnRemote = (name: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/peer_name`,
			args: [{ type: "s", value: name }]
		}));
	};

export const setLinkAudioLatencyMsOnRemote = (latencyMs: number): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/latency_ms`,
			args: [{ type: "f", value: Math.min(2000, Math.max(0, latencyMs)) }]
		}));
	};

export const setLinkAudioSyncToIncomingOnRemote = (enabled: boolean): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sync_to_incoming`,
			args: [{
				value: enabled ? "true" : "false",
				type: enabled ? OSCQueryValueType.True : OSCQueryValueType.False
			}]
		}));
	};

export const setLinkEnabledOnRemote = (enabled: boolean): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: "/rnbo/jack/link/enabled",
			args: [{
				value: enabled ? "true" : "false",
				type: enabled ? OSCQueryValueType.True : OSCQueryValueType.False
			}]
		}));
	};

// Zero the cumulative dropout count so it reads as "dropouts since I changed a setting".
// Omit the key to reset every source. Sent as a bang (no arguments).
export const resetLinkAudioSourceDropoutsOnRemote = (key?: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: key
				? `${oscLinkAudioPrefix}/sources/${key}/reset_dropouts`
				: `${oscLinkAudioPrefix}/sources/reset_dropouts`,
			args: []
		}));
	};

// Renaming a sink is addressed by key: the name is what's changing.
export const setLinkAudioSinkNameOnRemote = (key: string, name: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sinks/${key}/name`,
			args: [{ type: "s", value: name }]
		}));
	};
