import { Record as ImmuRecord } from "immutable";
import { OSCQueryRNBOInstanceMessageInfo, OSCQueryRNBOInstanceMessages, OSCQueryRNBOInstanceMessageValue } from "../lib/types";
import { PatcherInstanceRecord } from "./instance";

export type MessagePortRecordProps = {
	instanceIndex: number;
	tag: string;
	meta: string;
	value: string;
	path: string;
};


export class MessagePortRecord extends ImmuRecord<MessagePortRecordProps>({
	instanceIndex: 0,
	tag: "",
	meta: "",
	value: "",
	path: ""
}) {

	private static messagesArrayFromDescription(instanceIndex: PatcherInstanceRecord["index"], desc: OSCQueryRNBOInstanceMessageInfo, name: string): MessagePortRecord[] {
		if (typeof desc.VALUE !== "undefined") {
			return [
				new MessagePortRecord({
					instanceIndex,
					tag: name,
					path: (desc as OSCQueryRNBOInstanceMessageValue).FULL_PATH,
					meta: (desc as OSCQueryRNBOInstanceMessageValue).CONTENTS?.meta?.VALUE || ""
				})
			];
		}

		const result: MessagePortRecord[] = [];
		for (const [subKey, subDesc] of Object.entries(desc.CONTENTS)) {
			const subPrefix = name ? `${name}/${subKey}` : subKey;
			result.push(...this.messagesArrayFromDescription(instanceIndex, subDesc, subPrefix));
		}
		return result;
	}

	public static fromDescription(instanceIndex: PatcherInstanceRecord["index"], messagesDesc?: OSCQueryRNBOInstanceMessages): MessagePortRecord[] {
		const ports: MessagePortRecord[] = [];
		for (const [name, desc] of Object.entries(messagesDesc?.CONTENTS || {})) {
			ports.push(...this.messagesArrayFromDescription(instanceIndex, desc, name));
		}
		return ports;
	}

	public get id(): string {
		return this.path;
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

}
