import { OrderedMap as ImmuOrderedMap } from "immutable";
import { RootStateType } from "../lib/store";
import { LinkAudioPeerInfo, LinkAudioSinkRecord, LinkAudioSourceRecord } from "../models/linkAudio";

export const getLinkAudioAvailable = (state: RootStateType): boolean => state.linkAudio.available;

export const getLinkEnabled = (state: RootStateType): boolean => state.linkAudio.linkEnabled;

export const getLinkAudioPeers = (state: RootStateType): LinkAudioPeerInfo[] => state.linkAudio.peers;

export const getLinkAudioPeerName = (state: RootStateType): string => state.linkAudio.peerName;

export const getLinkAudioLatencyMs = (state: RootStateType): number => state.linkAudio.latencyMs;

export const getLinkAudioSyncToIncoming = (state: RootStateType): boolean => state.linkAudio.syncToIncoming;

export const getLinkAudioSourceOrder = (state: RootStateType): string[] => state.linkAudio.sourceOrder;

export const getLinkAudioSinkOrder = (state: RootStateType): string[] => state.linkAudio.sinkOrder;

export const getLinkAudioSources = (state: RootStateType): ImmuOrderedMap<string, LinkAudioSourceRecord> => state.linkAudio.sources;

export const getLinkAudioSinks = (state: RootStateType): ImmuOrderedMap<string, LinkAudioSinkRecord> => state.linkAudio.sinks;

// Records in display order, dropping any key the order array doesn't know about yet (the order
// param and the slot nodes arrive as separate messages).
export const getLinkAudioSourcesOrdered = (state: RootStateType): LinkAudioSourceRecord[] =>
	state.linkAudio.sourceOrder
		.map(key => state.linkAudio.sources.get(key))
		.filter((s): s is LinkAudioSourceRecord => !!s);

export const getLinkAudioSinksOrdered = (state: RootStateType): LinkAudioSinkRecord[] =>
	state.linkAudio.sinkOrder
		.map(key => state.linkAudio.sinks.get(key))
		.filter((s): s is LinkAudioSinkRecord => !!s);
