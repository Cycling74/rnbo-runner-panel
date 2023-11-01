import { Record as ImmuRecord } from "immutable";
import { GraphNodeRecord, NodeType, PortDirection } from "./graph";

export type EditorNodeRecordProps = {
	id: string;
	contentHeight: number;
	selected: boolean;
	type: NodeType;
	x: number;
	y: number;
}


export const EditorNodeBaseHeight = 200;
export class EditorNodeRecord extends ImmuRecord<EditorNodeRecordProps>({

	id: "",
	contentHeight: 0,
	selected: false,
	type: NodeType.System,
	y: 0,
	x: 0

}) {

	private static readonly headerHeight = 50;
	private static readonly portHeight = 20;
	private static readonly portSpacing = 30;
	private static readonly width = 300;

	public static calculateContentHeight(ports: GraphNodeRecord["ports"]): number {
		const { sinkCount, sourceCount } = ports.valueSeq().reduce((result, port) => {
			if (port.direction === PortDirection.Sink) {
				result.sinkCount += 1;
			} else {
				result.sourceCount += 1;
			}
			return result;
		}, { sinkCount: 0, sourceCount: 0 });

		return (sinkCount > sourceCount ? sinkCount : sourceCount) * (this.portHeight + this.portSpacing);
	}

	public static create({ id, type, x = 0, y = 0, ports }: Pick<EditorNodeRecordProps, "id" | "type"> & { x?: number; y?: number; ports: GraphNodeRecord["ports"] }): EditorNodeRecord {
		return new EditorNodeRecord({
			id,
			contentHeight: this.calculateContentHeight(ports),
			x,
			y,
			type
		});
	}

	public get height(): number {
		return this.contentHeight + EditorNodeRecord.headerHeight;
	}

	public get width(): number {
		return EditorNodeRecord.width;
	}

	public updateContentHeight(ports: GraphNodeRecord["ports"]): EditorNodeRecord {
		return this.set("contentHeight", EditorNodeRecord.calculateContentHeight(ports));
	}

	public updatePosition(x: number, y: number): EditorNodeRecord {
		return this.withMutations(record => record.set("x", x).set("y", y));
	}

	public select(): EditorNodeRecord {
		return this.set("selected", true);
	}

	public unselect(): EditorNodeRecord {
		return this.set("selected", false);
	}

	public toggleSelect(): EditorNodeRecord {
		return this.set("selected", !this.selected);
	}
}

export type EditorEdgeRecordProps = {
	id: string;
	selected: boolean;
}

export class EditorEdgeRecord extends ImmuRecord<EditorEdgeRecordProps>({
	id: "",
	selected: false
}) {

	public static create({ id, selected = false }: Pick<EditorEdgeRecordProps, "id"> & { selected?: boolean }): EditorEdgeRecord {
		return new EditorEdgeRecord({ id, selected });
	}

	public select(): EditorEdgeRecord {
		return this.set("selected", true);
	}

	public unselect(): EditorEdgeRecord {
		return this.set("selected", false);
	}

	public toggleSelect(): EditorEdgeRecord {
		return this.set("selected", !this.selected);
	}
}
