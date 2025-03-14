import { modals } from "@mantine/modals";
import { Button, MantineColor, Stack, Text, TextInput } from "@mantine/core";
import { v4 } from "uuid";
import { ChangeEvent, FC, FormEvent, useCallback, useState } from "react";
import { replaceInvalidNameChars } from "./util";

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


export type InputDialogDesc = {
	text: string;
	validate?: (value: string) => true | string;
	value?: string;
	actions: {
		cancel?: DialogAction;
		confirm?: DialogAction;
	};
};


const InputModal: FC<InputDialogDesc & { onCancel: () => void; onConfirm: (v: string) => void;}> = ({
	actions,
	onCancel,
	onConfirm,
	text,
	validate,
	value: initialValue
}) => {

	const [value, setValue] = useState<string>(initialValue || "");
	const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

	const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		const v = replaceInvalidNameChars(e.target.value || "");
		setValue(v);
		if (errorMsg && v.length) setErrorMsg(undefined);
	}, [setValue, errorMsg, setErrorMsg]);

	const onTriggerConfirm = useCallback((e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		const v = value.trim();
		if (!validate) return onConfirm(v);

		const msg = validate(v);
		if (msg === true) return onConfirm(v);
		setErrorMsg(msg);

	}, [onConfirm, setErrorMsg, value]);

	return (
		<form onSubmit={ onTriggerConfirm } >
			<Stack gap="lg">
				<Text fz="md" ta="center">{ text }</Text>
				<TextInput
					error={ errorMsg }
					onChange={ onChange }
					value={ value }
				/>
				<Stack gap="xs">
					<Button type="submit" variant="filled" color={ actions.confirm.color }>{ actions.confirm.label }</Button>
					<Button variant="default" color={ actions.cancel.color } onClick={ onCancel } >{ actions.cancel.label }</Button>
				</Stack>
			</Stack>
		</form>
	);
};


export const showTextInputDialog = ({
	text,
	actions: {
		cancel = { label: "Cancel" },
		confirm = { label: "Confirm" }
	},
	validate,
	value = ""
}: InputDialogDesc): Promise<DialogResult.Cancel | string> => {
	return new Promise<DialogResult.Cancel | string>(resolve => {

		const modalId = v4();

		const onCancel = () => {
			modals.close(modalId);
			resolve(DialogResult.Cancel);
		};

		const onConfirm = (v: string) => {
			modals.close(modalId);
			resolve(v);
		};

		modals.open({
			modalId,
			centered: true,
			children: (
				<InputModal
					actions={{ cancel, confirm }}
					onCancel={ onCancel }
					onConfirm={ onConfirm }
					text={ text }
					validate={ validate }
					value={ value }
				/>
			),
			closeOnClickOutside: false,
			withCloseButton: false
		});
	});
}
