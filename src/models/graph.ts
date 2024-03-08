
import { Record as ImmuRecord, Map as ImmuMap, Set as ImmuSet } from "immutable";
import { OSCQueryRNBOInstance, OSCQueryRNBOJackPortInfo } from "../lib/types";

export enum ConnectionType {
	Audio = "audio",
	MIDI = "midi"
}

export enum PortDirection {
	Sink,
	Source
}

export enum NodeType {
	Control = "control",
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

export const calculateNodeContentHeight = (ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>): number => {
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
	jackName: string;
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>;
	contentHeight: number;
	selected: boolean;
	x: number;
	y: number;
}

export type GraphSystemNodeProps = CommonGraphNodeProps & {
	direction: PortDirection;
	id: string;

}

export type GraphPatcherNodeProps = CommonGraphNodeProps & {
	index: number;
	patcher: string;
	path: string;
}

export type GraphControlNodeProps = CommonGraphNodeProps & {
	path: string;
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

export interface GraphControlNode extends GraphNode {
	type: NodeType.Control
}

export class GraphPatcherNodeRecord extends ImmuRecord<GraphPatcherNodeProps>({

	index: 0,
	jackName: "",
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
		return this.jackName;
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
			jackName: this.getJackName(desc.CONTENTS.jack),
			patcher: desc.CONTENTS.name.VALUE,
			path: desc.FULL_PATH,
			ports,
			contentHeight: calculateNodeContentHeight(ports),
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

	public setPortsByType(type: ConnectionType, direction: PortDirection, newPorts: GraphPortRecord[]): GraphSystemNodeRecord {
		const portList = this.ports
			// Filter out existing ports with the same type and direction as we'll reset them below
			.filterNot(port => port.type === type && port.direction === direction)
			// Add new ports
			.withMutations(map => {
				for (const port of newPorts) {
					map.set(port.id, port);
				}
			});

		return this
			.set("ports", portList)
			.set("contentHeight", calculateNodeContentHeight(portList));
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

	public static createPorts(jackName: string, type: ConnectionType, direction: PortDirection, portNames: string[]): Array<GraphPortRecord> {
		const portNameReplace = `${jackName}:`;
		const ports: GraphPortRecord[] = [];
		for (const portName of portNames) {
			if (portName.startsWith(portNameReplace)) {
				ports.push(new GraphPortRecord({
					id: portName.replace(portNameReplace, ""),
					direction,
					type
				}));
			}
		}
		return ports;
	}

	static fromDescription(systemJackNames: ImmuSet<string>, desc: OSCQueryRNBOJackPortInfo): GraphSystemNodeRecord[] {

		// We expect systemJackNames to be a Set of all, non rnbo instances jack assigned names
		// in order to be able to filter out the global Jack Port description for creating SystemNodes.
		// This is necessary as SystemNodes, in contrast to rnbo instances, don't have a dedicated tree desc
		const nodes: GraphSystemNodeRecord[] = [];

		for (const jackName of systemJackNames.valueSeq().toArray()) {

			const inputPorts = [
				...this.createPorts(
					jackName,
					ConnectionType.Audio,
					PortDirection.Source,
					desc.CONTENTS.audio.CONTENTS.sources.TYPE !== "" && desc.CONTENTS.audio.CONTENTS.sources.VALUE.length ? desc.CONTENTS.audio.CONTENTS.sources.VALUE : []
				),
				...this.createPorts(
					jackName,
					ConnectionType.MIDI,
					PortDirection.Source,
					desc.CONTENTS.midi.CONTENTS.sources.TYPE !== "" && desc.CONTENTS.midi.CONTENTS.sources.VALUE.length ? desc.CONTENTS.midi.CONTENTS.sources.VALUE : []
				)
			];

			const outputPorts = [
				...this.createPorts(
					jackName,
					ConnectionType.Audio,
					PortDirection.Sink,
					desc.CONTENTS.audio.CONTENTS.sinks.TYPE !== "" && desc.CONTENTS.audio.CONTENTS.sinks.VALUE.length ? desc.CONTENTS.audio.CONTENTS.sinks.VALUE : []
				),
				...this.createPorts(
					jackName,
					ConnectionType.MIDI,
					PortDirection.Sink,
					desc.CONTENTS.midi.CONTENTS.sinks.TYPE !== "" && desc.CONTENTS.midi.CONTENTS.sinks.VALUE.length ? desc.CONTENTS.midi.CONTENTS.sinks.VALUE : []
				)
			];

			if (inputPorts.length) {
				const ports = ImmuMap<GraphPortRecord["id"], GraphPortRecord>(inputPorts.map(p => [p.id, p]));
				nodes.push(
					new GraphSystemNodeRecord({
						jackName,
						direction: PortDirection.Source,
						id: `${jackName}${this.inputSuffix}`,
						ports,
						contentHeight: calculateNodeContentHeight(ports),
						selected: false,
						x: 0,
						y: 0
					})
				);
			}

			if (outputPorts.length) {
				const ports = ImmuMap<GraphPortRecord["id"], GraphPortRecord>(outputPorts.map(p => [p.id, p]));
				nodes.push(
					new GraphSystemNodeRecord({
						jackName,
						direction: PortDirection.Sink,
						id: `${jackName}${this.outputSuffix}`,
						ports,
						contentHeight: calculateNodeContentHeight(ports),
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

export class GraphControlNodeRecord extends ImmuRecord<GraphControlNodeProps>({

	jackName: "",
	path: "",
	ports: ImmuMap<GraphPortRecord["id"], GraphPortRecord>(),

	// Editor props
	contentHeight: 0,
	selected: false,
	y: 0,
	x: 0

}) implements GraphControlNode {


	public getPort(id: GraphPortRecord["id"]): GraphPortRecord | undefined {
		return this.ports.get(id);
	}

	public get id(): string {
		return this.jackName;
	}

	public get type(): NodeType.Control {
		return NodeType.Control;
	}

	public get height(): number {
		return this.contentHeight + headerHeight;
	}

	public get width(): number {
		return nodeWidth;
	}

	public updatePosition(x: number, y: number): GraphControlNodeRecord {
		return this.withMutations(record => record.set("x", x).set("y", y));
	}

	public select(): GraphControlNodeRecord {
		return this.set("selected", true);
	}

	public unselect(): GraphControlNodeRecord {
		return this.set("selected", false);
	}

	public toggleSelect(): GraphControlNodeRecord {
		return this.set("selected", !this.selected);
	}

	public static createPorts(jackName: string, type: ConnectionType, direction: PortDirection, portNames: string[]): Array<GraphPortRecord> {
		const portNameReplace = `${jackName}:`;
		const ports: GraphPortRecord[] = [];

		for (const portName of portNames) {
			ports.push(new GraphPortRecord({
				id: portName.replace(portNameReplace, ""),
				direction,
				type
			}));
		}
		return ports;
	}

	public static fromDescription(jackName: string, portNames: { audioSinks?: string[], audioSources?: string[], midiSinks?: string[], midiSources?: string[] } ): GraphControlNodeRecord {
		const portList = [
			...this.createPorts(jackName, ConnectionType.Audio, PortDirection.Sink, portNames.audioSinks || []),
			...this.createPorts(jackName, ConnectionType.Audio, PortDirection.Source, portNames.audioSources || []),
			...this.createPorts(jackName, ConnectionType.MIDI, PortDirection.Sink, portNames.midiSinks || []),
			...this.createPorts(jackName, ConnectionType.MIDI, PortDirection.Source, portNames.midiSources || [])
		];

		const ports = ImmuMap<GraphPortRecord["id"], GraphPortRecord>(portList.map(p => [p.id, p]));
		return new GraphControlNodeRecord({
			jackName,
			ports,
			contentHeight: calculateNodeContentHeight(ports),
			selected: false,
			x: 0,
			y: 0
		});
	}
}

export type GraphNodeRecord = GraphPatcherNodeRecord | GraphSystemNodeRecord | GraphControlNodeRecord;

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
}
