import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstanceMessageInfo } from "../lib/types";

export type MessagePortRecordProps = {
	tag: string;
	meta: string;
	value: string;
};


export class MessagePortRecord extends ImmuRecord<MessagePortRecordProps>({
	tag: "",
	meta: "",
	value: ""
}) {

	public get id(): string {
		return this.tag;
	}

	public get name(): string {
		return this.tag;
	}

	public setMeta(value: string): MessagePortRecord {
		return this.set("meta", value);
	}

	public setValue(value: string): MessagePortRecord {
		return this.set("value", value);
	}

	public static fromDescription(tag: string, desc: OSCQueryRNBOInstanceMessageInfo): MessagePortRecord {
		return new MessagePortRecord({
			tag
		});
	}

}
