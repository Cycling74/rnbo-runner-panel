import { modals } from "@mantine/modals";
import { Button, MantineColor, Stack, Text } from "@mantine/core";
import { v4 } from "uuid";

export type DialogAction = {
	label: string;
	color?: MantineColor;
};

export enum DialogResult {
	Cancel,
	Discard,
	Confirm
}

export type ConfirmDialogDesc = {
	text: string;
	actions: {
		cancel?: DialogAction;
		discard?: DialogAction;
		confirm?: DialogAction;
	};
};

export const showConfirmDialog = ({
	text,
	actions: {
		cancel = { label: "Cancel" },
		discard = undefined,
		confirm = { label: "Confirm" }
	}
}: ConfirmDialogDesc): Promise<DialogResult> => {

	return new Promise<DialogResult>(resolve => {
		const modalId = v4();

		const onCancel = () => {
			modals.close(modalId);
			resolve(DialogResult.Cancel);
		};

		const onDiscard = () => {
			modals.close(modalId);
			resolve(DialogResult.Discard);
		};

		const onConfirm = () => {
			modals.close(modalId);
			resolve(DialogResult.Confirm);
		};


		modals.open({
			modalId,
			centered: true,
			children: (
				<Stack gap="lg">
					<Text fz="md" ta="center">{ text }</Text>
					<Stack gap="xs">
						<Button variant="filled" color={ confirm.color } onClick={ onConfirm } >{ confirm.label }</Button>
						{ discard ? <Button variant="default" color={ discard.color } onClick={ onDiscard } mb="xs" >{ discard?.label }</Button> : null }
						<Button variant="default" color={ cancel.color } onClick={ onCancel } >{ cancel.label }</Button>
					</Stack>
				</Stack>
			),
			closeOnClickOutside: false,
			withCloseButton: false
		});
	});
};
