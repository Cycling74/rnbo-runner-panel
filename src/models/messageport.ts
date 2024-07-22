import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstanceMessageValue } from "../lib/types";

export type MessagePortRecordProps = {
	tag: string;
	meta: string;
	value: string;
	path: string;
};


export class MessagePortRecord extends ImmuRecord<MessagePortRecordProps>({
	tag: "",
	meta: "",
	value: "",
	path: ""
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

	public static fromDescription(tag: string, desc: OSCQueryRNBOInstanceMessageValue): MessagePortRecord {
		return new MessagePortRecord({
			tag,
			path: desc.FULL_PATH,
			meta: desc.CONTENTS?.meta?.VALUE || ""
		});
	}

}
