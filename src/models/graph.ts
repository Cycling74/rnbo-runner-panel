
import { Record as ImmuRecord, Set as ImmuSet } from "immutable";
import { RNBOJackPortProperties } from "../lib/types";
import { KnownPortGroup, knownPortGroupDisplayNames, RNBOJackPortPropertyKey } from "../lib/constants";

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

export type NodePositionProps = {
	id: string;
	x: number;
	y: number;
};

export class NodePositionRecord extends ImmuRecord<NodePositionProps>({
	id: "",
	x: 0,
	y: 0
}) {

	public updatePosition(x: number, y: number): NodePositionRecord {
		return this.set("x", x).set("y", y);
	}

	public static fromDescription(id: string, x: number, y: number): NodePositionRecord {
		return new NodePositionRecord({ id, x, y });
	}
}


export type GraphPortProps = {
	aliases: ImmuSet<string>;
	id: string;
	direction: PortDirection;
	nodeId: string;
	portName: string;
	properties: RNBOJackPortProperties;
	type: ConnectionType;
}

export class GraphPortRecord extends ImmuRecord<GraphPortProps> ({

	aliases: ImmuSet<string>(),
	id: "",
	direction: PortDirection.Source,
	nodeId: "",
	portName: "",
	properties: {},
	type: ConnectionType.Audio

}) {

	private static parseProperties(value: string): RNBOJackPortProperties {
		try {
			return JSON.parse(value) as RNBOJackPortProperties;
		} catch (err) {
			return {};
		}
	}

	public get isHidden(): boolean {
		return this.properties[RNBOJackPortPropertyKey.PortGroup] === KnownPortGroup.Hidden;
	}

	public get isPatcherInstancePort(): boolean {
		return this.properties[RNBOJackPortPropertyKey.InstanceId] !== undefined;
	}

	public get displayName(): string {
		return this.properties[RNBOJackPortPropertyKey.PrettyName] ||
			this.portName.replace(/\((capture|playback)_[0-9]+\)/, "");
	}

	public get instanceId(): string | undefined {
		return this.properties[RNBOJackPortPropertyKey.InstanceId] !== undefined
			? `${this.properties[RNBOJackPortPropertyKey.InstanceId]}`
			: undefined;
	}

	public addAlias(alias: string): GraphPortRecord {
		return this.aliases.has(alias) ? this : this.set("aliases", this.aliases.add(alias));
	}

	public removeAlias(alias: string): GraphPortRecord {
		return !this.aliases.has(alias) ? this : this.set("aliases", this.aliases.delete(alias));
	}

	public clearAliases(): GraphPortRecord {
		return this.set("aliases", this.aliases.clear());
	}

	public setAliases(aliases: string[]): GraphPortRecord {
		return this.set("aliases", ImmuSet<string>(aliases));
	}

	public setDirection(direction: PortDirection): GraphPortRecord {
		return this.set("direction", direction);
	}

	public setProperties(propertyVal: string): GraphPortRecord {
		const properties = GraphPortRecord.parseProperties(propertyVal);
		const nodeId = properties[RNBOJackPortPropertyKey.PortGroup] || this.nodeId;
		return this
			.set("properties", properties)
			.set("nodeId", nodeId);
	}

	public setType(type: ConnectionType): GraphPortRecord {
		return this.set("type", type);
	}

	public static fromDescription(id: string, type: ConnectionType, direction: PortDirection, propertyVal: string): GraphPortRecord {
		const properties = this.parseProperties(propertyVal);

		return new GraphPortRecord({
			id,
			direction,
			type,
			nodeId: properties[RNBOJackPortPropertyKey.PortGroup] || id.split(":").shift(),
			portName: id.split(":").pop(),
			properties
		});
	}
}

export type GraphNodeProps = {
	id: string;
	instanceId: string;
	selected: boolean;
	type: NodeType;
};

export interface GraphNode extends GraphNodeProps {}

export class GraphNodeRecord extends ImmuRecord<GraphNodeProps>({

	id: "system",
	instanceId: "0",
	type: NodeType.System,

	// Editor props
	selected: false

}) implements GraphNode {

	public get displayName(): string {
		return knownPortGroupDisplayNames.get(this.id) || this.id;
	}

	public get isHidden(): boolean {
		return this.id === KnownPortGroup.Hidden;
	}

	public select(): GraphNodeRecord {
		return this.set("selected", true);
	}

	public unselect(): GraphNodeRecord {
		return this.set("selected", false);
	}

	public toggleSelect(): GraphNodeRecord {
		return this.set("selected", !this.selected);
	}

	public static fromDescription(id: string, type: NodeType, instanceId?: string): GraphNodeRecord {
		return new GraphNodeRecord({
			id,
			instanceId,
			selected: false,
			type
		});
	}
}

export type GraphConnectionProps = {
	sourcePortId: string;
	sinkPortId: string;
	selected: boolean;
	type: ConnectionType;
}

export class GraphConnectionRecord extends ImmuRecord<GraphConnectionProps>({

	sourcePortId: "",
	sinkPortId: "",

	selected: false,
	type: ConnectionType.Audio

}) {

	public get id(): string {
		return GraphConnectionRecord.idFromPorts(this.sourcePortId, this.sinkPortId);
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

	public static idFromPorts(sourcePortId: string, sinkPortId: string): string {
		return `${sourcePortId}${this.connectionDelimiter}${sinkPortId}`;
	}
}
