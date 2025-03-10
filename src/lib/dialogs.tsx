import { modals } from "@mantine/modals";
import { Button, MantineColor, Stack, Text } from "@mantine/core";
import { v4 } from "uuid";

export type ConfirmAction = {
	label: string;
	color?: MantineColor;
}

export type ConfirmDialogDesc = {
	text: string;
	actions: {
		cancel?: ConfirmAction;
		discard?: ConfirmAction;
		confirm?: ConfirmAction;
	};
};

export enum ConfirmDialogResult {
	Cancel,
	Discard,
	Confirm
}

export const showConfirmDialog = ({
	text,
	actions: {
		cancel = { label: "Cancel" },
		discard = undefined,
		confirm = { label: "Confirm" }
	}
}: ConfirmDialogDesc): Promise<ConfirmDialogResult> => {

	return new Promise<ConfirmDialogResult>(resolve => {
		const modalId = v4();

		const onCancel = () => {
			modals.close(modalId);
			resolve(ConfirmDialogResult.Cancel);
		};

		const onDiscard = () => {
			modals.close(modalId);
			resolve(ConfirmDialogResult.Discard);
		};

		const onConfirm = () => {
			modals.close(modalId);
			resolve(ConfirmDialogResult.Confirm);
		};


		modals.open({
			modalId,
			centered: true,
			children: (
				<Stack gap="lg">
					<Text fz="md" ta="center">{ text }</Text>
					<Stack gap="xs">
						<Button variant="filled" color={ confirm.color } onClick={ onConfirm } >{ confirm.label }</Button>
						{ discard ? <Button variant="default" color={ discard.color } onClick={ onDiscard } >{ discard?.label } </Button> : null }
					</Stack>
					<Button variant="default" color={ cancel.color } onClick={ onCancel } >{ cancel.label }</Button>
				</Stack>
			),
			closeOnClickOutside: false,
			withCloseButton: false
		});
	});
};
