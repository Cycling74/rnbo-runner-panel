import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { NotificationRecord } from "../models/notification";

export const getNotification = (state: RootStateType, id: string): NotificationRecord | undefined => {
	return state.nofitications.items.get(id);
};

export const getNotifications = (state: RootStateType): ImmuMap<string, NotificationRecord> => {
	return state.nofitications.items;
};
