import { OrderedMap as ImmuOrderedMap } from "immutable";
import { RootStateType } from "../lib/store";
import { LinkAudioPeerInfo, LinkAudioSinkRecord, LinkAudioSourceRecord } from "../models/linkAudio";

export const getLinkAudioAvailable = (state: RootStateType): boolean => state.linkAudio.available;

export const getLinkAudioPeers = (state: RootStateType): LinkAudioPeerInfo[] => state.linkAudio.peers;

export const getLinkAudioPeerName = (state: RootStateType): string => state.linkAudio.peerName;

export const getLinkAudioSourceCount = (state: RootStateType): number => state.linkAudio.sourceCount;

export const getLinkAudioSinkCount = (state: RootStateType): number => state.linkAudio.sinkCount;

export const getLinkAudioSources = (state: RootStateType): ImmuOrderedMap<string, LinkAudioSourceRecord> => state.linkAudio.sources;

export const getLinkAudioSinks = (state: RootStateType): ImmuOrderedMap<string, LinkAudioSinkRecord> => state.linkAudio.sinks;
