import { v4 } from "uuid";
import { Record as ImmuRecord } from "immutable";

export const NotificationTimeout = 5000;

export enum NotificationLevel {
	error = -1,
	warn = 0,
	info = 1,
	success = 2,
}

export class NotificationRecord extends ImmuRecord({

	id: "",
	level: NotificationLevel.info,
	message: "",
	title: ""

}) {

	static create({ level, message, title }: { level: NotificationLevel; message: string; title: string }): NotificationRecord {

		return new NotificationRecord({
			id: v4(),
			level,
			message: message || "",
			title
		});
	}
}
