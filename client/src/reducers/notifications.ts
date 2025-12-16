import { Map as ImmuMap } from "immutable";
import { NotificationRecord } from "../models/notification";
import { NotificationActionType, NotificationAction } from "../actions/notifications";

export interface NotificationState {
	items: ImmuMap<string, NotificationRecord>;
}
export const nofitications = (state: NotificationState = {
	items: ImmuMap<string, NotificationRecord>()
}, action: NotificationAction): NotificationState => {

	switch (action.type) {
		case NotificationActionType.ADD_NOTIFICATION: {
			const { notification } = action.payload;
			return {
				...state,
				items: state.items.set(notification.id, notification)
			};
		}

		case NotificationActionType.DELETE_NOTIFICATION: {
			const { id } = action.payload;

			return {
				...state,
				items: state.items.delete(id)
			};
		}

		default:
			return state;
	}
};
