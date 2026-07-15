import { OrderedMap as ImmuOrderedMap } from "immutable";
import { LinkAudioAction, LinkAudioActionType } from "../actions/linkAudio";
import { LinkAudioPeerInfo, LinkAudioSinkRecord, LinkAudioSourceRecord } from "../models/linkAudio";

export interface LinkAudioState {
	available: boolean;
	peers: LinkAudioPeerInfo[];
	peerName: string;
	sourceCount: number;
	sinkCount: number;
	sources: ImmuOrderedMap<string, LinkAudioSourceRecord>;
	sinks: ImmuOrderedMap<string, LinkAudioSinkRecord>;
}

const defaultState: LinkAudioState = {
	available: false,
	peers: [],
	peerName: "",
	sourceCount: 0,
	sinkCount: 0,
	sources: ImmuOrderedMap<string, LinkAudioSourceRecord>(),
	sinks: ImmuOrderedMap<string, LinkAudioSinkRecord>()
};

export const linkAudio = (state: LinkAudioState = defaultState, action: LinkAudioAction): LinkAudioState => {

	switch (action.type) {

		case LinkAudioActionType.INIT: {
			const { available, peers, peerName, sourceCount, sinkCount, sources, sinks } = action.payload;
			return { available, peers, peerName, sourceCount, sinkCount, sources, sinks };
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
