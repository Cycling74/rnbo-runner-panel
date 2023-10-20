import { Record as ImmuRecord } from "immutable";
import { NodeType } from "./graph";

export type EditorNodeRecordProps = {
	id: string;
	type: NodeType;
	x: number;
	y: number;
}

export const EditorNodeBaseHeight = 60;
export const EditorNodeOutputHeight = 15;

export class EditorNodeRecord extends ImmuRecord<EditorNodeRecordProps>({

	id: "",
	type: NodeType.System,
	y: 0,
	x: 0

}) {

	public static create({ id, type, x, y }: EditorNodeRecordProps): EditorNodeRecord {
		return new EditorNodeRecord({
			id,
			x,
			y,
			type
		});
	}
}
