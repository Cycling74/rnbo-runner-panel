import { ActionBase } from "../lib/store";
import { NotificationLevel, NotificationRecord } from "../models/notification";

export enum NotificationActionType {
	ADD_NOTIFICATION = "ADD_NOTIFICATION",
	DELETE_NOTIFICATION = "DELETE_NOTIFICATION"
}

export interface AddNotificationAction extends ActionBase {
	type: NotificationActionType.ADD_NOTIFICATION;
	payload: {
		notification: NotificationRecord;
	};
}

export interface DeleteNotificationAction extends ActionBase {
	type: NotificationActionType.DELETE_NOTIFICATION;
	payload: {
		id: string;
	};
}


export type NotificationAction = AddNotificationAction | DeleteNotificationAction;

export const showNotification = ({ title, message, level = NotificationLevel.info }: { title: string, message?: string; level?: NotificationLevel }): NotificationAction => {
	return {
		type: NotificationActionType.ADD_NOTIFICATION,
		payload: {
			notification: NotificationRecord.create({ level, message: message || "", title })
		}
	};
};

export const deleteNotification = (notification: NotificationRecord): NotificationAction => {
	return {
		type: NotificationActionType.DELETE_NOTIFICATION,
		payload: {
			id: notification.id
		}
	};
};
