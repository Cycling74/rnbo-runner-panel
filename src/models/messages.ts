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
};

export class MessageOutputRecord extends ImmuRecord<MessageOutputRecordProps>({

	name: ""

}) {

	static fromDescription(name: string): MessageOutputRecord {
		return new MessageOutputRecord({ name });
	}

	get id(): string {
		return this.name;
	}
}
