import { FunctionComponent, memo, useEffect } from "react";
import { NotificationLevel, NotificationRecord, NotificationTimeout } from "../../models/notification";
import { Notification } from "@mantine/core";

export interface NotificationItemProps {
	notification: NotificationRecord;
	onDismiss: (notif: NotificationRecord) => any;
}

const notifColors: Record<NotificationLevel, string> = {
	[NotificationLevel.error]: "red",
	[NotificationLevel.warn]: "yellow",
	[NotificationLevel.info]: "blue",
	[NotificationLevel.success]: "green"
};


const NotificationItem: FunctionComponent<NotificationItemProps> = memo(function Notif({
	onDismiss,
	notification
}) {

	useEffect(() => {
		const dismissTO = setTimeout(() => onDismiss(notification), NotificationTimeout);
		return () => clearTimeout(dismissTO);
	}, [onDismiss, notification]);

	return (
		<Notification
			title={ notification.title }
			color={ notifColors[notification.level] }
			onClose={ () => onDismiss(notification) }
		>
			{ notification.message }
		</Notification>
	);
});

export default NotificationItem;
