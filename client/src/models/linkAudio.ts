import { Record as ImmuRecord } from "immutable";

// A single channel advertised by a Link Audio peer on the network.
export type LinkAudioChannelInfo = {
	peer: string;
	channel: string;
};

// Available peers/channels, grouped by peer, as published by jack_transport_link.
export type LinkAudioPeerInfo = {
	peer: string;
	channels: string[];
};

export type LinkAudioSourceProps = {
	// slot key: 12 hex chars derived by jack_transport_link from the identity below. The runner
	// names this source's OSCQuery node after it; we only ever echo it back.
	key: string;
	// the configured identity — matched exactly against an advertised peer/channel
	peer: string;
	channel: string;
	connected: boolean;
	// true while audio is actually being rendered. connected && !receiving = subscribed but
	// producing pure silence, which the dropout count cannot report (it only counts starves
	// after playback has started) — usually the playout buffer is too small for the network.
	receiving: boolean;
	// live receive telemetry (from linkaudio/source-status, proxied by the runner)
	bufferedMs: number;
	dropouts: number;
	// measured delay between the live beat and where the newest arrived buffer begins. Latency
	// has to exceed this for anything to play, so it's what an unexpectedly large required
	// buffer should be compared against.
	arrivalOffsetMs: number;
	jitterMs: number;
};

export class LinkAudioSourceRecord extends ImmuRecord<LinkAudioSourceProps>({
	key: "",
	peer: "",
	channel: "",
	connected: false,
	receiving: false,
	bufferedMs: 0,
	dropouts: 0,
	arrivalOffsetMs: 0,
	jitterMs: 0
}) {
	get id(): string {
		return this.key;
	}

	get label(): string {
		return this.peer.length && this.channel.length ? `${this.peer} / ${this.channel}` : `${this.peer}${this.channel}`;
	}
}

export type LinkAudioSinkProps = {
	key: string;
	name: string;
};

export class LinkAudioSinkRecord extends ImmuRecord<LinkAudioSinkProps>({
	key: "",
	name: ""
}) {
	get id(): string {
		return this.key;
	}
}

// Parse the linkaudio/channels JSON blob into a list of peers.
export const parseLinkAudioChannels = (json: string | undefined): LinkAudioPeerInfo[] => {
	if (!json) return [];
	try {
		const parsed = JSON.parse(json);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.filter(entry => entry && typeof entry.peer === "string" && Array.isArray(entry.channels))
			.map(entry => ({
				peer: entry.peer as string,
				channels: (entry.channels as unknown[]).filter(c => typeof c === "string") as string[]
			}));
	} catch {
		return [];
	}
};
