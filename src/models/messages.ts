import { Record as ImmuRecord } from "immutable";
import { OSCValue } from "../lib/types";

export type MessageInportRecordProps = {
	name: string;
};

export class MessageInportRecord extends ImmuRecord<MessageInportRecordProps>({

	name: ""

}) {

	static fromDescription(name: string): MessageInportRecord {
		return new MessageInportRecord({ name });
	}

	get id(): string {
		return this.name;
	}
}

export type MessageOutputRecordProps = {
	name: string;
	lastValue: string | undefined;
};

export class MessageOutputRecord extends ImmuRecord<MessageOutputRecordProps>({

	name: "",
	lastValue: ""

}) {

	static fromDescription(name: string): MessageOutputRecord {
		return new MessageOutputRecord({ name });
	}

	get id(): string {
		return this.name;
	}

	public setLastValue(v: OSCValue | OSCValue[]): MessageOutputRecord {
		return this.set("lastValue", Array.isArray(v) ? v.join(", ") : `${v}`);
	}
}
