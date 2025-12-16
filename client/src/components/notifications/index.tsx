import { FunctionComponent, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { getNotifications } from "../../selectors/notifications";
import { RootStateType } from "../../lib/store";
import { NotificationRecord } from "../../models/notification";
import NotificationItem from "./item";
import { deleteNotification } from "../../actions/notifications";
import classes from "./notifications.module.css";

const Notifications: FunctionComponent = () => {

	const notifications = useAppSelector((state: RootStateType) => getNotifications(state));
	const dispatch = useAppDispatch();
	const onDismiss = useCallback((notification: NotificationRecord) => {
		dispatch(deleteNotification(notification));
	}, [dispatch]);

	return (
		<div className={ classes.notificationsList } >
			{
				notifications.valueSeq().map((notif: NotificationRecord) => <NotificationItem key={ notif.id } notification={ notif } onDismiss={ onDismiss } />)
			}
		</div>
	);
};

export default Notifications;
