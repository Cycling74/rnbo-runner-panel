
import { Record as ImmuRecord, Map as ImmuMap } from "immutable";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstanceConnections, OSCQueryRNBOJackPortInfo } from "../lib/types";

export enum ConnectionType {
	Audio = "audio",
	MIDI = "midi"
}

export enum PortDirection {
	Sink,
	Source
}

export enum NodeType {
	Patcher = "patcher",
	System = "system"
}

export type GraphPortProps = {
	id: string;
	direction: PortDirection;
	type: ConnectionType;
}

export class GraphPortRecord extends ImmuRecord<GraphPortProps> ({

	id: "",
	direction: PortDirection.Source,
	type: ConnectionType.Audio

}) {}

const headerHeight = 50;
const portHeight = 20;
const portSpacing = 30;
const nodeWidth = 300;

const calculateContentHeight = (ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>): number => {
	const { sinkCount, sourceCount } = ports.valueSeq().reduce((result, port) => {
		if (port.direction === PortDirection.Sink) {
			result.sinkCount += 1;
		} else {
			result.sourceCount += 1;
		}
		return result;
	}, { sinkCount: 0, sourceCount: 0 });

	return (sinkCount > sourceCount ? sinkCount : sourceCount) * (portHeight + portSpacing);
};

export type CommonGraphNodeProps = {
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>;
	contentHeight: number;
	selected: boolean;
	x: number;
	y: number;
}

export type GraphSystemNodeProps = CommonGraphNodeProps & {
	name: string;
}

export type GraphPatcherNodeProps = CommonGraphNodeProps & {
	index: number;
	patcher: string;
	path: string;
	name: string;
}

export interface GraphNode extends CommonGraphNodeProps {
	id: string;
	getPort: (name: GraphPortRecord["id"]) => GraphPortRecord | undefined;
	type: NodeType;
}

export interface GraphPatcherNode extends GraphNode {
	type: NodeType.Patcher;
}

export interface GraphSystemNode extends GraphNode {
	type: NodeType.System;
}

export class GraphPatcherNodeRecord extends ImmuRecord<GraphPatcherNodeProps>({

	index: 0,
	name: "",
	patcher: "",
	path: "",
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>(),

	// Editor props
	contentHeight: 0,
	selected: false,
	y: 0,
	x: 0

}) implements GraphPatcherNode {


	public getPort(id: GraphPortRecord["id"]): GraphPortRecord | undefined {
		return this.ports.get(id);
	}

	public get id(): string {
		return this.name;
	}

	public get type(): NodeType.Patcher {
		return NodeType.Patcher;
	}

	public get height(): number {
		return this.contentHeight + headerHeight;
	}

	public get width(): number {
		return nodeWidth;
	}

	public updatePosition(x: number, y: number): GraphPatcherNodeRecord {
		return this.withMutations(record => record.set("x", x).set("y", y));
	}

	public select(): GraphPatcherNodeRecord {
		return this.set("selected", true);
	}

	public unselect(): GraphPatcherNodeRecord {
		return this.set("selected", false);
	}

	public toggleSelect(): GraphPatcherNodeRecord {
		return this.set("selected", !this.selected);
	}

	public static getJackName(desc: OSCQueryRNBOInstance["CONTENTS"]["jack"]): string {
		return desc.CONTENTS.name.VALUE as string;
	}

	public static portsFromDescription(desc: OSCQueryRNBOInstance["CONTENTS"]["jack"]): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {

		const name = this.getJackName(desc);
		const portNameReplace = `${name}:`;

		return ImmuMap<GraphPortRecord["id"], GraphPortRecord>().withMutations((ports) => {

			if (desc.CONTENTS.audio_ins.TYPE !== "" && desc.CONTENTS.audio_ins.VALUE.length) {
				for (const portName of desc.CONTENTS.audio_ins.VALUE) {
					const pr = new GraphPortRecord({
						id: portName.replace(portNameReplace, ""),
						direction: PortDirection.Sink,
						type: ConnectionType.Audio
					});

					ports.set(pr.id, pr);
				}
			}

			if (desc.CONTENTS.audio_outs.TYPE !== "" && desc.CONTENTS.audio_outs.VALUE.length) {
				for (const portName of desc.CONTENTS.audio_outs.VALUE) {
					const pr = new GraphPortRecord({
						id: portName.replace(portNameReplace, ""),
						direction: PortDirection.Source,
						type: ConnectionType.Audio
					});

					ports.set(pr.id, pr);
				}
			}
			if (desc.CONTENTS.midi_ins.TYPE !== "" && desc.CONTENTS.midi_ins.VALUE.length) {
				for (const portName of desc.CONTENTS.midi_ins.VALUE) {
					const pr = new GraphPortRecord({
						id: portName.replace(portNameReplace, ""),
						direction: PortDirection.Sink,
						type: ConnectionType.MIDI
					});

					ports.set(pr.id, pr);
				}
			}

			if (desc.CONTENTS.midi_outs.TYPE !== "" && desc.CONTENTS.midi_outs.VALUE.length) {
				for (const portName of desc.CONTENTS.midi_outs.VALUE) {
					const pr = new GraphPortRecord({
						id: portName.replace(portNameReplace, ""),
						direction: PortDirection.Source,
						type: ConnectionType.MIDI
					});
					ports.set(pr.id, pr);
				}
			}
		});
	}

	public static fromDescription(desc: OSCQueryRNBOInstance): GraphPatcherNodeRecord {
		const ports = this.portsFromDescription(desc.CONTENTS.jack);

		return new GraphPatcherNodeRecord({
			index: parseInt(desc.FULL_PATH.split("/").pop(), 10),
			name: this.getJackName(desc.CONTENTS.jack),
			patcher: desc.CONTENTS.name.VALUE,
			path: desc.FULL_PATH,
			ports,
			contentHeight: calculateContentHeight(ports),
			selected: false,
			x: 0,
			y: 0
		});
	}

}

export class GraphSystemNodeRecord extends ImmuRecord<GraphSystemNodeProps>({

	name: "",
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>(),

	// Editor props
	contentHeight: 0,
	selected: false,
	y: 0,
	x: 0

}) implements GraphSystemNode {

	public getPort(id: GraphPortRecord["id"]): GraphPortRecord | undefined {
		return this.ports.get(id);
	}

	get id(): string {
		return this.name;
	}

	get type(): NodeType.System {
		return NodeType.System;
	}

	public get height(): number {
		return this.contentHeight + headerHeight;
	}

	public get width(): number {
		return nodeWidth;
	}

	public updatePosition(x: number, y: number): GraphSystemNodeRecord {
		return this.withMutations(record => record.set("x", x).set("y", y));
	}

	public select(): GraphSystemNodeRecord {
		return this.set("selected", true);
	}

	public unselect(): GraphSystemNodeRecord {
		return this.set("selected", false);
	}

	public toggleSelect(): GraphSystemNodeRecord {
		return this.set("selected", !this.selected);
	}

	static get systemAudioName(): string {
		return "system";
	}


	static get systemMIDIName(): string {
		return "system_midi";
	}

	static get systemAudioOutputName(): string {
		return `${this.systemAudioName}_audio-out`;
	}

	static get systemAudioInputName(): string {
		return `${this.systemAudioName}_audio-in`;
	}

	static get systemMIDIOutputName(): string {
		return `${this.systemMIDIName}-out`;
	}

	static get systemMIDIInputName(): string {
		return `${this.systemMIDIName}-in`;
	}

	private static audioSinksFromDescription(desc: OSCQueryRNBOJackPortInfo): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {

		const portNameReplace = `${this.systemAudioName}:`;

		return ImmuMap<GraphPortRecord["id"], GraphPortRecord>().withMutations(ports => {
			if (
				desc.CONTENTS.audio.CONTENTS.sinks.TYPE !== "" &&
				desc.CONTENTS.audio.CONTENTS.sinks.VALUE.length
			) {
				for (const portName of desc.CONTENTS.audio.CONTENTS.sinks.VALUE) {
					if (portName.startsWith(portNameReplace)) {
						const port = new GraphPortRecord({
							id: portName.replace(portNameReplace, ""),
							direction: PortDirection.Sink,
							type: ConnectionType.Audio
						});
						ports.set(port.id, port);
					}
				}
			}
		});
	}

	private static midiSinksFromDescription(desc: OSCQueryRNBOJackPortInfo): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {

		const portNameReplace = `${this.systemMIDIName}:`;

		return ImmuMap<GraphPortRecord["id"], GraphPortRecord>().withMutations(ports => {
			if (
				desc.CONTENTS.midi.CONTENTS.sinks.TYPE !== "" &&
				desc.CONTENTS.midi.CONTENTS.sinks.VALUE.length
			) {
				for (const portName of desc.CONTENTS.midi.CONTENTS.sinks.VALUE) {
					if (portName.startsWith(portNameReplace)) {
						const port = new GraphPortRecord({
							id: portName.replace(portNameReplace, ""),
							direction: PortDirection.Sink,
							type: ConnectionType.MIDI
						});
						ports.set(port.id, port);
					}
				}
			}
		});
	}

	private static audioSourcesFromDescription(desc: OSCQueryRNBOJackPortInfo): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {
		const portNameReplace = `${this.systemAudioName}:`;
		return ImmuMap<GraphPortRecord["id"], GraphPortRecord>().withMutations(ports => {
			if (
				desc.CONTENTS.audio.CONTENTS.sources.TYPE !== "" &&
				desc.CONTENTS.audio.CONTENTS.sources.VALUE.length
			) {
				for (const portName of desc.CONTENTS.audio.CONTENTS.sources.VALUE) {
					if (portName.startsWith(portNameReplace)) {
						const port = new GraphPortRecord({
							id: portName.replace(portNameReplace, ""),
							direction: PortDirection.Source,
							type: ConnectionType.Audio
						});
						ports.set(port.id, port);
					}
				}
			}

			if (
				desc.CONTENTS.midi.CONTENTS.sources.TYPE !== "" &&
				desc.CONTENTS.midi.CONTENTS.sources.VALUE.length
			) {
				for (const portName of desc.CONTENTS.midi.CONTENTS.sources.VALUE) {
					if (portName.startsWith(portNameReplace)) {
						const port = new GraphPortRecord({
							id: portName.replace(portNameReplace, ""),
							direction: PortDirection.Source,
							type: ConnectionType.MIDI
						});
						ports.set(port.id, port);
					}
				}
			}
		});
	}

	private static midiSourcesFromDescription(desc: OSCQueryRNBOJackPortInfo): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {
		const portNameReplace = `${this.systemMIDIName}:`;
		return ImmuMap<GraphPortRecord["id"], GraphPortRecord>().withMutations(ports => {
			if (
				desc.CONTENTS.midi.CONTENTS.sources.TYPE !== "" &&
				desc.CONTENTS.midi.CONTENTS.sources.VALUE.length
			) {
				for (const portName of desc.CONTENTS.midi.CONTENTS.sources.VALUE) {
					if (portName.startsWith(portNameReplace)) {
						const port = new GraphPortRecord({
							id: portName.replace(portNameReplace, ""),
							direction: PortDirection.Source,
							type: ConnectionType.MIDI
						});
						ports.set(port.id, port);
					}
				}
			}
		});
	}

	static fromDescription(desc: OSCQueryRNBOJackPortInfo): GraphSystemNodeRecord[] {
		// System Audio Input
		const audioInputPorts = this.audioSourcesFromDescription(desc);
		const audioInput = new GraphSystemNodeRecord({
			name: this.systemAudioInputName,
			ports: audioInputPorts,
			contentHeight: calculateContentHeight(audioInputPorts),
			selected: false,
			x: 0,
			y: 0
		});

		// System Audio Output
		const audioOutputPorts = this.audioSinksFromDescription(desc);
		const audioOutput = new GraphSystemNodeRecord({
			name: this.systemAudioOutputName,
			ports: audioOutputPorts,
			contentHeight: calculateContentHeight(audioOutputPorts),
			selected: false,
			x: 0,
			y: 0
		});

		// System MIDI Input
		const midiInputPorts = this.midiSourcesFromDescription(desc);
		const midiInput = new GraphSystemNodeRecord({
			name: this.systemMIDIInputName,
			ports: midiInputPorts,
			contentHeight: calculateContentHeight(midiInputPorts),
			selected: false,
			x: 0,
			y: 0
		});

		// System Audio Output
		const midiOutputPorts = this.midiSinksFromDescription(desc);
		const midiOutput = new GraphSystemNodeRecord({
			name: this.systemMIDIOutputName,
			ports: midiOutputPorts,
			contentHeight: calculateContentHeight(midiOutputPorts),
			selected: false,
			x: 0,
			y: 0
		});

		return [audioInput, audioOutput, midiInput, midiOutput];
	}
}

export type GraphNodeRecord = GraphPatcherNodeRecord | GraphSystemNodeRecord;

export type GraphConnectionProps = {
	sourceNodeId: string;
	sourcePortId: string;
	sinkNodeId: string;
	sinkPortId: string;
	selected: boolean;
	type: ConnectionType;
}

export class GraphConnectionRecord extends ImmuRecord<GraphConnectionProps>({

	sourceNodeId: "",
	sourcePortId: "",

	sinkNodeId: "",
	sinkPortId: "",

	selected: false,
	type: ConnectionType.Audio

}) {

	public get id(): string {
		return GraphConnectionRecord.idFromNodesAndPorts(this.sourceNodeId, this.sourcePortId, this.sinkNodeId, this.sinkPortId);
	}

	public select(): GraphConnectionRecord {
		return this.set("selected", true);
	}

	public unselect(): GraphConnectionRecord {
		return this.set("selected", false);
	}

	public toggleSelect(): GraphConnectionRecord {
		return this.set("selected", !this.selected);
	}

	private static readonly connectionDelimiter = "__=__";

	public static idFromNodesAndPorts(sourceId: string, sourcePortId: string, sinkId: string, sinkPortId: string): string {
		return `${sourceId}:${sourcePortId}${this.connectionDelimiter}${sinkId}:${sinkPortId}`;
	}

	public static patcherNodeConnectionsFromDescription(nodeId: GraphNodeRecord["id"], desc: OSCQueryRNBOInstanceConnections): GraphConnectionRecord[] {
		const conns: GraphConnectionRecord[] = [];

		// Patcher Node as Source
		for (const [portId, info] of Object.entries(desc.CONTENTS.audio?.CONTENTS?.sources?.CONTENTS || {})) {
			const commonConnProps: Omit<GraphConnectionProps, "id" | "sinkNodeId" | "sinkPortId"> = {
				sourceNodeId: nodeId,
				sourcePortId: portId,
				selected: false,
				type: ConnectionType.Audio
			};

			conns.push(...(info.VALUE.map(target => {
				const [sinkNodeId, sinkPortId] = target.split(":");
				return new GraphConnectionRecord({
					...commonConnProps,
					sinkNodeId: sinkNodeId === GraphSystemNodeRecord.systemAudioName ? GraphSystemNodeRecord.systemAudioOutputName : sinkNodeId,
					sinkPortId
				});
			})));
		}

		for (const [portId, info] of Object.entries(desc.CONTENTS.midi?.CONTENTS?.sources?.CONTENTS || {})) {
			const commonConnProps: Omit<GraphConnectionProps, "id" | "sinkNodeId" | "sinkPortId"> = {
				sourceNodeId: nodeId,
				sourcePortId: portId,
				selected: false,
				type: ConnectionType.MIDI
			};

			conns.push(...(info.VALUE.map(target => {
				const [sinkNodeId, sinkPortId] = target.split(":");
				return new GraphConnectionRecord({
					...commonConnProps,
					sinkNodeId: sinkNodeId === GraphSystemNodeRecord.systemMIDIName ? GraphSystemNodeRecord.systemMIDIOutputName : sinkNodeId,
					sinkPortId
				});
			})));
		}

		// Patcher Node as Sink - Apply only to connections to system Nodes
		for (const [portId, info] of Object.entries(desc.CONTENTS.audio?.CONTENTS?.sinks?.CONTENTS || {})) {
			const commonConnProps: Omit<GraphConnectionProps, "id" | "sourceNodeId" | "sourcePortId"> = {
				sinkNodeId: nodeId,
				sinkPortId: portId,
				selected: false,
				type: ConnectionType.Audio
			};

			for (const target of info.VALUE) {
				const [soureNodeId, sourcePortId] = target.split(":");
				if (soureNodeId !== GraphSystemNodeRecord.systemAudioName) continue;
				conns.push(new GraphConnectionRecord({
					...commonConnProps,
					sourceNodeId: GraphSystemNodeRecord.systemAudioInputName,
					sourcePortId
				}));
			}
		}

		for (const [portId, info] of Object.entries(desc.CONTENTS.midi?.CONTENTS?.sinks?.CONTENTS || {})) {
			const commonConnProps: Omit<GraphConnectionProps, "id" | "sourceNodeId" | "sourcePortId"> = {
				sinkNodeId: nodeId,
				sinkPortId: portId,
				selected: false,
				type: ConnectionType.MIDI
			};

			for (const target of info.VALUE) {
				const [soureNodeId, sourcePortId] = target.split(":");
				if (soureNodeId !== GraphSystemNodeRecord.systemMIDIName) continue;
				conns.push(new GraphConnectionRecord({
					...commonConnProps,
					sourceNodeId: GraphSystemNodeRecord.systemMIDIInputName,
					sourcePortId
				}));
			}
		}


		return conns;
	}
}
