import { Map as ImmuMap } from "immutable";
import { RootStateType } from "../lib/store";
import { NotificationRecord } from "../models/notification";
import { createSelector } from "reselect";

export const getNotifications = (state: RootStateType): ImmuMap<NotificationRecord["id"], NotificationRecord> => {
	return state.nofitications.items;
};

export const getNotification = createSelector(
	[
		getNotifications,
		(state: RootStateType, id: string): string => id
	],
	(nofitications, id): NotificationRecord | undefined => {
		return nofitications.get(id);
	}
);
