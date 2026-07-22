import { OrderedMap as ImmuOrderedMap } from "immutable";
import { LinkAudioAction, LinkAudioActionType } from "../actions/linkAudio";
import { LinkAudioPeerInfo, LinkAudioSinkRecord, LinkAudioSourceRecord } from "../models/linkAudio";

export interface LinkAudioState {
	available: boolean;
	linkEnabled: boolean;
	peers: LinkAudioPeerInfo[];
	peerName: string;
	latencyMs: number;
	syncToIncoming: boolean;
	sourceCount: number;
	sinkCount: number;
	sources: ImmuOrderedMap<string, LinkAudioSourceRecord>;
	sinks: ImmuOrderedMap<string, LinkAudioSinkRecord>;
}

const defaultState: LinkAudioState = {
	available: false,
	linkEnabled: true,
	peers: [],
	peerName: "",
	latencyMs: 100,
	syncToIncoming: false,
	sourceCount: 0,
	sinkCount: 0,
	sources: ImmuOrderedMap<string, LinkAudioSourceRecord>(),
	sinks: ImmuOrderedMap<string, LinkAudioSinkRecord>()
};

export const linkAudio = (state: LinkAudioState = defaultState, action: LinkAudioAction): LinkAudioState => {

	switch (action.type) {

		case LinkAudioActionType.INIT: {
			const { available, peers, peerName, latencyMs, syncToIncoming, sourceCount, sinkCount, sources, sinks } = action.payload;
			// linkEnabled comes from the sibling /rnbo/jack/link/enabled node (not the audio
			// subtree parsed here), so preserve it across the audio-subtree re-init.
			return { ...state, available, peers, peerName, latencyMs, syncToIncoming, sourceCount, sinkCount, sources, sinks };
		}

		case LinkAudioActionType.SET_AVAILABLE: {
			return { ...state, available: action.payload.available };
		}

		case LinkAudioActionType.SET_PEERS: {
			return { ...state, peers: action.payload.peers };
		}

		case LinkAudioActionType.SET_PEER_NAME: {
			return { ...state, peerName: action.payload.peerName };
		}

		case LinkAudioActionType.SET_SOURCE_COUNT: {
			return { ...state, sourceCount: action.payload.count };
		}

		case LinkAudioActionType.SET_SINK_COUNT: {
			return { ...state, sinkCount: action.payload.count };
		}

		case LinkAudioActionType.SET_LATENCY_MS: {
			return { ...state, latencyMs: action.payload.latencyMs };
		}

		case LinkAudioActionType.SET_SYNC_TO_INCOMING: {
			return { ...state, syncToIncoming: action.payload.syncToIncoming };
		}

		case LinkAudioActionType.SET_LINK_ENABLED: {
			return { ...state, linkEnabled: action.payload.linkEnabled };
		}

		case LinkAudioActionType.UPDATE_SOURCE: {
			const { index, changes } = action.payload;
			const key = `${index}`;
			const existing = state.sources.get(key) || new LinkAudioSourceRecord({ index });
			return { ...state, sources: state.sources.set(key, existing.merge(changes) as LinkAudioSourceRecord) };
		}

		case LinkAudioActionType.UPDATE_SINK: {
			const { index, changes } = action.payload;
			const key = `${index}`;
			const existing = state.sinks.get(key) || new LinkAudioSinkRecord({ index });
			return { ...state, sinks: state.sinks.set(key, existing.merge(changes) as LinkAudioSinkRecord) };
		}

		default:
			return state;
	}
};
