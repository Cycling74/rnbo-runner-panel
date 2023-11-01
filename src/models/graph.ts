
import { Record as ImmuRecord, Map as ImmuMap } from "immutable";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstanceConnections, OSCQueryRNBOInstancePresetEntries, OSCQueryRNBOJackPortInfo } from "../lib/types";
import { ParameterRecord } from "./parameter";
import { MessageInportRecord, MessageOutputRecord } from "./messages";
import { PresetRecord } from "./preset";

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

}) {
}

export type CommonGraphNodeProps = {
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>;
}

export type GraphSystemNodeProps = CommonGraphNodeProps & {
	name: string;
}

export type GraphPatcherNodeProps = CommonGraphNodeProps & {
	index: number;
	patcher: string;
	path: string;
	name: string;
	messageInputs: ImmuMap<MessageInportRecord["id"], MessageInportRecord>;
	messageOutputs: ImmuMap<MessageOutputRecord["id"], MessageOutputRecord>;
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>;
	presets: ImmuMap<PresetRecord["id"], PresetRecord>;
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

	messageInputs: ImmuMap<MessageInportRecord["id"], MessageInportRecord>(),
	messageOutputs: ImmuMap<MessageOutputRecord["id"], MessageOutputRecord>(),
	parameters: ImmuMap<ParameterRecord["id"], ParameterRecord>(),
	presets: ImmuMap<PresetRecord["id"], PresetRecord>(),
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>()

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

	public setParameterValue(id: ParameterRecord["id"], value: number): GraphPatcherNodeRecord {
		const param = this.parameters.get(id);
		if (!param) return this;

		return this.set("parameters", this.parameters.set(param.id, param.setValue(value)));
	}

	public setParameterNormalizedValue(id: ParameterRecord["id"], value: number): GraphPatcherNodeRecord {
		const param = this.parameters.get(id);
		if (!param) return this;

		return this.set("parameters", this.parameters.set(param.id, param.setNormalizedValue(value)));
	}

	public static presetsFromDescription(entries: OSCQueryRNBOInstancePresetEntries): ImmuMap<PresetRecord["id"], PresetRecord> {
		return ImmuMap<PresetRecord["id"], PresetRecord>().withMutations((map) => {
			for (const name of entries.VALUE) {
				const pr = PresetRecord.fromDescription(name);
				map.set(pr.id, pr);
			}
		});
	}

	public static messageInputsFromDescription(messagesDesc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): ImmuMap<MessageInportRecord["id"], MessageInportRecord> {
		return ImmuMap<MessageInportRecord["id"], MessageInportRecord>().withMutations((map) => {
			for (const name of Object.keys(messagesDesc?.CONTENTS?.in?.CONTENTS || {})) {
				const mr = MessageInportRecord.fromDescription(name);
				map.set(mr.id, mr);
			}
		});
	}

	public static messageOutputsFromDescription(messagesDesc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): ImmuMap<MessageOutputRecord["id"], MessageOutputRecord> {
		return ImmuMap<MessageOutputRecord["id"], MessageOutputRecord>().withMutations((map) => {
			for (const name of Object.keys(messagesDesc?.CONTENTS?.out?.CONTENTS || {})) {
				const mr = MessageOutputRecord.fromDescription(name);
				map.set(mr.id, mr);
			}
		});
	}

	public static parametersFromDescription(paramsDesc: OSCQueryRNBOInstance["CONTENTS"]["params"]): ImmuMap<ParameterRecord["id"], ParameterRecord> {
		return ImmuMap<ParameterRecord["id"], ParameterRecord>().withMutations((map) => {
			for (const [name, desc] of Object.entries(paramsDesc.CONTENTS || {})) {
				const pr = ParameterRecord.fromDescription(name, desc);
				map.set(pr.id, pr);
			}
		});
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

		return new GraphPatcherNodeRecord({
			index: parseInt(desc.FULL_PATH.split("/").pop(), 10),
			name: this.getJackName(desc.CONTENTS.jack),
			patcher: desc.CONTENTS.name.VALUE,
			path: desc.FULL_PATH,
			messageInputs: this.messageInputsFromDescription(desc.CONTENTS.messages),
			messageOutputs: this.messageOutputsFromDescription(desc.CONTENTS.messages),
			parameters: this.parametersFromDescription(desc.CONTENTS.params),
			ports: this.portsFromDescription(desc.CONTENTS.jack),
			presets: this.presetsFromDescription(desc.CONTENTS.presets.CONTENTS.entries)
		});
	}

}

export class GraphSystemNodeRecord extends ImmuRecord<GraphSystemNodeProps>({

	name: "",
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>()

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

	static get systemName(): string {
		return "system";
	}

	static get systemOutputName(): string {
		return `${this.systemName}-out`;
	}

	static get systemInputName(): string {
		return `${this.systemName}-in`;
	}

	private static sinksFromDescription(desc: OSCQueryRNBOJackPortInfo): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {

		const portNameReplace = `${this.systemName}:`;

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

	private static sourcesFromDescription(desc: OSCQueryRNBOJackPortInfo): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {
		const portNameReplace = `${this.systemName}:`;
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

	static fromDescription(desc: OSCQueryRNBOJackPortInfo): GraphSystemNodeRecord[] {
		return [
			// System Input
			new GraphSystemNodeRecord({
				name: this.systemInputName,
				ports: this.sourcesFromDescription(desc)
			}),
			// System Output
			new GraphSystemNodeRecord({
				name: this.systemOutputName,
				ports: this.sinksFromDescription(desc)
			})
		];
	}
}

export type GraphNodeRecord = GraphPatcherNodeRecord | GraphSystemNodeRecord;

export type GraphConnectionProps = {
	sourceNodeId: string;
	sourcePortId: string;
	sinkNodeId: string;
	sinkPortId: string;
	type: ConnectionType;
}

export class GraphConnectionRecord extends ImmuRecord<GraphConnectionProps>({

	sourceNodeId: "",
	sourcePortId: "",

	sinkNodeId: "",
	sinkPortId: "",

	type: ConnectionType.Audio

}) {

	public get id(): string {
		return GraphConnectionRecord.idFromNodesAndPorts(this.sourceNodeId, this.sourcePortId, this.sinkNodeId, this.sinkPortId);
	}

	private static readonly connectionDelimiter = "__=__";
	public static idFromNodesAndPorts(sourceId: string, sourcePortId: string, sinkId: string, sinkPortId: string): string {
		return `${sourceId}:${sourcePortId}${this.connectionDelimiter}${sinkId}:${sinkPortId}`;
	}

	public static connectionsFromDescription(nodeId: GraphNodeRecord["id"], desc: OSCQueryRNBOInstanceConnections): GraphConnectionRecord[] {
		const conns: GraphConnectionRecord[] = [];

		// Node as source
		for (const [portId, info] of Object.entries(desc.CONTENTS.audio?.CONTENTS?.sources?.CONTENTS || {})) {
			const commonConnProps: Omit<GraphConnectionProps, "id" | "sinkNodeId" | "sinkPortId"> = {
				sourceNodeId: nodeId,
				sourcePortId: portId,
				type: ConnectionType.Audio
			};

			conns.push(...(info.VALUE.map(target => {
				const [sinkNodeId, sinkPortId] = target.split(":");
				return new GraphConnectionRecord({
					...commonConnProps,
					sinkNodeId: sinkNodeId === GraphSystemNodeRecord.systemName ? GraphSystemNodeRecord.systemOutputName : sinkNodeId,
					sinkPortId
				});
			})));
		}

		for (const [portId, info] of Object.entries(desc.CONTENTS.midi?.CONTENTS?.sources?.CONTENTS || {})) {
			const commonConnProps: Omit<GraphConnectionProps, "id" | "sinkNodeId" | "sinkPortId"> = {
				sourceNodeId: nodeId,
				sourcePortId: portId,
				type: ConnectionType.MIDI
			};

			conns.push(...(info.VALUE.map(target => {
				const [sinkNodeId, sinkPortId] = target.split(":");
				return new GraphConnectionRecord({
					...commonConnProps,
					sinkNodeId: sinkNodeId === GraphSystemNodeRecord.systemName ? GraphSystemNodeRecord.systemOutputName : sinkNodeId,
					sinkPortId
				});
			})));
		}

		// Node as sink gets only applied for system node connections
		for (const [portId, info] of Object.entries(desc.CONTENTS.audio?.CONTENTS?.sinks?.CONTENTS || {})) {
			const commonConnProps: Omit<GraphConnectionProps, "id" | "sourceNodeId" | "sourcePortId"> = {
				sinkNodeId: nodeId,
				sinkPortId: portId,
				type: ConnectionType.Audio
			};

			for (const target of info.VALUE) {
				const [soureNodeId, sourcePortId] = target.split(":");
				if (soureNodeId !== GraphSystemNodeRecord.systemName) continue;
				conns.push(new GraphConnectionRecord({
					...commonConnProps,
					sourceNodeId: GraphSystemNodeRecord.systemInputName,
					sourcePortId
				}));
			}
		}

		for (const [portId, info] of Object.entries(desc.CONTENTS.midi?.CONTENTS?.sources?.CONTENTS || {})) {
			const commonConnProps: Omit<GraphConnectionProps, "id" | "sourceNodeId" | "sourcePortId"> = {
				sinkNodeId: nodeId,
				sinkPortId: portId,
				type: ConnectionType.MIDI
			};

			for (const target of info.VALUE) {
				const [soureNodeId, sourcePortId] = target.split(":");
				if (soureNodeId !== GraphSystemNodeRecord.systemName) continue;
				conns.push(new GraphConnectionRecord({
					...commonConnProps,
					sourceNodeId: GraphSystemNodeRecord.systemInputName,
					sourcePortId
				}));
			}
		}


		return conns;
	}
}
