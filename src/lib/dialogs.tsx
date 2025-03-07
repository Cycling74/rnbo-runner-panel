import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";

export type ConfirmDialogDesc = {
	title: string;
	text: string;
	cancelLabel?: string;
	confirmLabel?: string;
};

export const showConfirmDialog = ({
	title,
	text,
	cancelLabel = "Cancel",
	confirmLabel = "Confirm"
}: ConfirmDialogDesc): Promise<boolean> => {

	return new Promise<boolean>(resolve => {
		modals.openConfirmModal({
			title,
			centered: true,
			children: <Text fz="sm">{ text }</Text>,
			labels: { confirm: confirmLabel, cancel: cancelLabel },
			onConfirm: () => resolve(true),
			onCancel: () => resolve(false)
		});
	});
};
