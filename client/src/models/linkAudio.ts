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
	index: number;
	name: string;
	// desired (configured) peer/channel substring filter; empty = auto
	selectPeer: string;
	selectChannel: string;
	// currently connected peer/channel (empty when unconnected)
	statusPeer: string;
	statusChannel: string;
	// live receive health (from linkaudio/source-health, proxied by the runner)
	bufferedMs: number;
	dropouts: number;
	jitterMs: number;
};

export class LinkAudioSourceRecord extends ImmuRecord<LinkAudioSourceProps>({
	index: 0,
	name: "",
	selectPeer: "",
	selectChannel: "",
	statusPeer: "",
	statusChannel: "",
	bufferedMs: 0,
	dropouts: 0,
	jitterMs: 0
}) {
	get id(): string {
		return `${this.index}`;
	}

	get connected(): boolean {
		return this.statusPeer.length > 0 || this.statusChannel.length > 0;
	}
}

export type LinkAudioSinkProps = {
	index: number;
	name: string;
};

export class LinkAudioSinkRecord extends ImmuRecord<LinkAudioSinkProps>({
	index: 0,
	name: ""
}) {
	get id(): string {
		return `${this.index}`;
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

// Parse a linkaudio/source/<N> status blob ({"peer":..,"channel":..} or {}) into peer/channel.
export const parseLinkAudioStatus = (json: string | undefined): { peer: string; channel: string; } => {
	if (!json) return { peer: "", channel: "" };
	try {
		const parsed = JSON.parse(json);
		if (parsed && typeof parsed === "object") {
			return {
				peer: typeof parsed.peer === "string" ? parsed.peer : "",
				channel: typeof parsed.channel === "string" ? parsed.channel : ""
			};
		}
	} catch {
		// ignore
	}
	return { peer: "", channel: "" };
};
