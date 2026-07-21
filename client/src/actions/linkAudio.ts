import { writePacket } from "osc/dist/osc-browser";
import { OrderedMap as ImmuOrderedMap } from "immutable";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOJackLinkAudio, OSCQueryValueType } from "../lib/types";
import {
	LinkAudioPeerInfo,
	LinkAudioSinkRecord,
	LinkAudioSourceRecord,
	parseLinkAudioChannels,
	parseLinkAudioStatus
} from "../models/linkAudio";

export enum LinkAudioActionType {
	INIT = "INIT_LINK_AUDIO",
	SET_AVAILABLE = "SET_LINK_AUDIO_AVAILABLE",
	SET_PEERS = "SET_LINK_AUDIO_PEERS",
	SET_PEER_NAME = "SET_LINK_AUDIO_PEER_NAME",
	SET_SOURCE_COUNT = "SET_LINK_AUDIO_SOURCE_COUNT",
	SET_SINK_COUNT = "SET_LINK_AUDIO_SINK_COUNT",
	SET_LATENCY_MS = "SET_LINK_AUDIO_LATENCY_MS",
	SET_SYNC_TO_INCOMING = "SET_LINK_AUDIO_SYNC_TO_INCOMING",
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
		sourceCount: number;
		sinkCount: number;
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

export interface ISetLinkAudioSourceCount extends ActionBase {
	type: LinkAudioActionType.SET_SOURCE_COUNT;
	payload: { count: number; };
}

export interface ISetLinkAudioSinkCount extends ActionBase {
	type: LinkAudioActionType.SET_SINK_COUNT;
	payload: { count: number; };
}

export interface ISetLinkAudioLatencyMs extends ActionBase {
	type: LinkAudioActionType.SET_LATENCY_MS;
	payload: { latencyMs: number; };
}

export interface ISetLinkAudioSyncToIncoming extends ActionBase {
	type: LinkAudioActionType.SET_SYNC_TO_INCOMING;
	payload: { syncToIncoming: boolean; };
}

export interface IUpdateLinkAudioSource extends ActionBase {
	type: LinkAudioActionType.UPDATE_SOURCE;
	payload: { index: number; changes: Partial<{ name: string; selectPeer: string; selectChannel: string; statusPeer: string; statusChannel: string; bufferedMs: number; dropouts: number; jitterMs: number; }>; };
}

export interface IUpdateLinkAudioSink extends ActionBase {
	type: LinkAudioActionType.UPDATE_SINK;
	payload: { index: number; changes: Partial<{ name: string; }>; };
}

export type LinkAudioAction = IInitLinkAudio | ISetLinkAudioAvailable | ISetLinkAudioPeers
| ISetLinkAudioPeerName | ISetLinkAudioSourceCount | ISetLinkAudioSinkCount | ISetLinkAudioLatencyMs
| ISetLinkAudioSyncToIncoming | IUpdateLinkAudioSource | IUpdateLinkAudioSink;

const oscLinkAudioPrefix = "/rnbo/jack/link/audio";

const isIndexKey = (key: string): boolean => /^\d+$/.test(key);

export const initLinkAudio = (info?: OSCQueryRNBOJackLinkAudio): LinkAudioAction => {
	const available = info?.CONTENTS?.available?.TYPE === OSCQueryValueType.True;
	const peers = parseLinkAudioChannels(info?.CONTENTS?.channels?.VALUE as string | undefined);
	const peerName = (info?.CONTENTS?.peer_name?.VALUE as string | undefined) || "";
	const latencyMs = (info?.CONTENTS?.latency_ms?.VALUE as number | undefined) ?? 100;
	const syncToIncoming = info?.CONTENTS?.sync_to_incoming?.TYPE !== OSCQueryValueType.False;

	const sourcesContents: Record<string, any> = info?.CONTENTS?.sources?.CONTENTS || {};
	const sinksContents: Record<string, any> = info?.CONTENTS?.sinks?.CONTENTS || {};

	const sourceCount = (sourcesContents.count as { VALUE?: number } | undefined)?.VALUE ?? 0;
	const sinkCount = (sinksContents.count as { VALUE?: number } | undefined)?.VALUE ?? 0;

	let sources = ImmuOrderedMap<string, LinkAudioSourceRecord>();
	Object.keys(sourcesContents).filter(isIndexKey).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).forEach(key => {
		const slot = (sourcesContents as Record<string, any>)[key];
		const index = parseInt(key, 10);
		const sel = (slot?.CONTENTS?.select?.VALUE as unknown[] | undefined) || [];
		const status = parseLinkAudioStatus(slot?.CONTENTS?.status?.VALUE as string | undefined);
		sources = sources.set(key, new LinkAudioSourceRecord({
			index,
			name: (slot?.CONTENTS?.name?.VALUE as string | undefined) || "",
			selectPeer: typeof sel[0] === "string" ? sel[0] as string : "",
			selectChannel: typeof sel[1] === "string" ? sel[1] as string : "",
			statusPeer: status.peer,
			statusChannel: status.channel,
			bufferedMs: (slot?.CONTENTS?.buffered_ms?.VALUE as number | undefined) ?? 0,
			dropouts: (slot?.CONTENTS?.dropouts?.VALUE as number | undefined) ?? 0,
			jitterMs: (slot?.CONTENTS?.jitter_ms?.VALUE as number | undefined) ?? 0
		}));
	});

	let sinks = ImmuOrderedMap<string, LinkAudioSinkRecord>();
	Object.keys(sinksContents).filter(isIndexKey).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).forEach(key => {
		const slot = (sinksContents as Record<string, any>)[key];
		sinks = sinks.set(key, new LinkAudioSinkRecord({
			index: parseInt(key, 10),
			name: (slot?.CONTENTS?.name?.VALUE as string | undefined) || ""
		}));
	});

	return {
		type: LinkAudioActionType.INIT,
		payload: { available, peers, peerName, latencyMs, syncToIncoming, sourceCount, sinkCount, sources, sinks }
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

export const setLinkAudioSourceCount = (count: number): LinkAudioAction => ({
	type: LinkAudioActionType.SET_SOURCE_COUNT,
	payload: { count }
});

export const setLinkAudioSinkCount = (count: number): LinkAudioAction => ({
	type: LinkAudioActionType.SET_SINK_COUNT,
	payload: { count }
});

export const setLinkAudioLatencyMs = (latencyMs: number): LinkAudioAction => ({
	type: LinkAudioActionType.SET_LATENCY_MS,
	payload: { latencyMs }
});

export const setLinkAudioSyncToIncoming = (syncToIncoming: boolean): LinkAudioAction => ({
	type: LinkAudioActionType.SET_SYNC_TO_INCOMING,
	payload: { syncToIncoming }
});

export const updateLinkAudioSource = (index: number, changes: IUpdateLinkAudioSource["payload"]["changes"]): LinkAudioAction => ({
	type: LinkAudioActionType.UPDATE_SOURCE,
	payload: { index, changes }
});

export const updateLinkAudioSink = (index: number, changes: IUpdateLinkAudioSink["payload"]["changes"]): LinkAudioAction => ({
	type: LinkAudioActionType.UPDATE_SINK,
	payload: { index, changes }
});

// Remote writes (drive the OSCQuery params; jack_transport_link persists everything).

export const setLinkAudioSourceCountOnRemote = (count: number): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sources/count`,
			args: [{ type: "i", value: Math.max(0, Math.round(count)) }]
		}));
	};

export const setLinkAudioSinkCountOnRemote = (count: number): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sinks/count`,
			args: [{ type: "i", value: Math.max(0, Math.round(count)) }]
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

export const setLinkAudioSourceNameOnRemote = (index: number, name: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sources/${index}/name`,
			args: [{ type: "s", value: name }]
		}));
	};

export const setLinkAudioSinkNameOnRemote = (index: number, name: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sinks/${index}/name`,
			args: [{ type: "s", value: name }]
		}));
	};

export const setLinkAudioSourceSelectOnRemote = (index: number, peer: string, channel: string): AppThunk =>
	() => {
		oscQueryBridge.sendPacket(writePacket({
			address: `${oscLinkAudioPrefix}/sources/${index}/select`,
			args: [
				{ type: "s", value: peer },
				{ type: "s", value: channel }
			]
		}));
	};
