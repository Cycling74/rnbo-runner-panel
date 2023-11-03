
import { Record as ImmuRecord, Map as ImmuMap, Set as ImmuSet } from "immutable";
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
	direction: PortDirection;
	id: string;
	jackName: string;
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

	direction: PortDirection.Source,
	id: "",
	jackName: "",
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

	public static get inputSuffix(): string {
		return "-in";
	}

	public static get outputSuffix(): string {
		return "-out";
	}

	private static sourcesFromDescription(nodeName: string, desc: OSCQueryRNBOJackPortInfo): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {
		const portNameReplace = `${nodeName}:`;
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

	private static sinksFromDescription(nodeName: string, desc: OSCQueryRNBOJackPortInfo): ImmuMap<GraphPortRecord["id"], GraphPortRecord> {
		const portNameReplace = `${nodeName}:`;
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

	static fromDescription(systemJackName: ImmuSet<string>, desc: OSCQueryRNBOJackPortInfo): GraphSystemNodeRecord[] {

		const nodes: GraphSystemNodeRecord[] = [];

		for (const jackName of systemJackName.valueSeq().toArray()) {

			const inputPorts = this.sourcesFromDescription(jackName, desc);
			const outputPorts = this.sinksFromDescription(jackName, desc);
			if (inputPorts.size) {
				nodes.push(
					new GraphSystemNodeRecord({
						jackName,
						direction: PortDirection.Source,
						id: `${jackName}${this.inputSuffix}`,
						ports: inputPorts,
						contentHeight: calculateContentHeight(inputPorts),
						selected: false,
						x: 0,
						y: 0
					})
				);
			}

			if (outputPorts.size) {
				nodes.push(
					new GraphSystemNodeRecord({
						jackName,
						direction: PortDirection.Sink,
						id: `${jackName}${this.outputSuffix}`,
						ports: outputPorts,
						contentHeight: calculateContentHeight(outputPorts),
						selected: false,
						x: 0,
						y: 0
					})
				);
			}
		}

		return nodes;
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

	public static patcherNodeConnectionsFromDescription(
		nodeId: GraphNodeRecord["id"],
		desc: OSCQueryRNBOInstanceConnections,
		systemNodeJackNames: ImmuSet<GraphSystemNodeRecord["jackName"]>
	): GraphConnectionRecord[] {
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
					sinkNodeId: systemNodeJackNames.has(sinkNodeId) ? `${sinkNodeId}${GraphSystemNodeRecord.outputSuffix}` : sinkNodeId,
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
					sinkNodeId: systemNodeJackNames.has(sinkNodeId) ? `${sinkNodeId}${GraphSystemNodeRecord.outputSuffix}` : sinkNodeId,
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
				if (!systemNodeJackNames.has(soureNodeId)) continue;
				conns.push(new GraphConnectionRecord({
					...commonConnProps,
					sourceNodeId: `${soureNodeId}${GraphSystemNodeRecord.inputSuffix}`,
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
				if (!systemNodeJackNames.has(soureNodeId)) continue;
				conns.push(new GraphConnectionRecord({
					...commonConnProps,
					sourceNodeId: `${soureNodeId}${GraphSystemNodeRecord.inputSuffix}`,
					sourcePortId
				}));
			}
		}


		return conns;
	}
}
