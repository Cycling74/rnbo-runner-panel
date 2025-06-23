import { modals } from "@mantine/modals";
import { Button, MantineColor, NativeSelect, Stack, Text, TextInput } from "@mantine/core";
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
					<Text fz="md">{ text }</Text>
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
	description?: string;
	label: string;
	text: string;
	validate?: (value: string) => true | string;
	value?: string;
	actions: {
		cancel?: DialogAction;
		discard?: DialogAction;
		confirm?: DialogAction;
	};
};

const InputModal: FC<InputDialogDesc & { onCancel: () => void; onConfirm: (v: string) => void; onDiscard?: () => void; }> = ({
	actions,
	description,
	label,
	onCancel,
	onConfirm,
	onDiscard,
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
		if (!validate) return void onConfirm(v);

		const msg = validate(v);
		if (msg === true) return void onConfirm(v);
		return void setErrorMsg(msg);
	}, [onConfirm, setErrorMsg, value, validate]);

	return (
		<form onSubmit={ onTriggerConfirm } >
			<Stack gap="lg">
				<Text fz="md">{ text }</Text>
				<TextInput
					description={ description }
					label={ label }
					error={ errorMsg }
					onChange={ onChange }
					value={ value }
				/>
				<Stack gap="xs">
					<Button type="submit" variant="filled" color={ actions.confirm.color }>{ actions.confirm.label }</Button>
					{ actions.discard ? <Button variant="default" color={ actions.discard.color } onClick={ onDiscard } mb="xs" >{ actions.discard.label }</Button> : null }
					<Button variant="default" color={ actions.cancel.color } onClick={ onCancel } >{ actions.cancel.label }</Button>
				</Stack>
			</Stack>
		</form>
	);
};

export const showTextInputDialog = ({
	description,
	label,
	text,
	actions: {
		cancel = { label: "Cancel" },
		discard = undefined,
		confirm = { label: "Confirm" }
	},
	validate,
	value = ""
}: InputDialogDesc): Promise<DialogResult.Cancel | DialogResult.Discard | string> => {
	return new Promise<DialogResult.Cancel | DialogResult.Discard | string>(resolve => {

		const modalId = v4();

		const onCancel = () => {
			modals.close(modalId);
			resolve(DialogResult.Cancel);
		};

		const onConfirm = (v: string) => {
			modals.close(modalId);
			resolve(v);
		};

		const onDiscard = () => {
			modals.close(modalId);
			resolve(DialogResult.Discard);
		};

		modals.open({
			modalId,
			centered: true,
			children: (
				<InputModal
					actions={{ cancel, confirm, discard }}
					description={ description }
					label={ label }
					onCancel={ onCancel }
					onConfirm={ onConfirm }
					onDiscard={ discard ? onDiscard : undefined }
					text={ text }
					validate={ validate }
					value={ value }
				/>
			),
			closeOnClickOutside: false,
			withCloseButton: false
		});
	});
};

export type SelectDialogDesc = {
	options: Array<string | { value: string; label: string; disabled?: boolean; }>;
	placeholder?: string;
	text: string;
	actions: {
		cancel?: DialogAction;
		confirm?: DialogAction;
	};
	initialValue?: string;
};

const SelectModal: FC<SelectDialogDesc & { onCancel: () => void; onConfirm: (v: string) => void; }> = ({
	actions,
	onCancel,
	onConfirm,
	options,
	placeholder = "Select",
	text,
	initialValue = ""
}) => {

	const [value, setValue] = useState<string>(initialValue);
	const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

	const onChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
		setValue(e.target.value);
		if (errorMsg) setErrorMsg(undefined);
	}, [setValue, errorMsg, setErrorMsg]);

	const onTriggerConfirm = useCallback((e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (value === "") return void setErrorMsg("Please select an option");
		return void onConfirm(value);
	}, [onConfirm, setErrorMsg, value]);

	return (
		<form onSubmit={ onTriggerConfirm } >
			<Stack gap="lg">
				<Text fz="md" ta="center">{ text }</Text>
				<NativeSelect
					data={ placeholder
						? [{ value: "", label: placeholder, disabled: true }, ...options]
						: options
					}
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

export const showSelectInputDialog = ({
	actions: {
		cancel = { label: "Cancel" },
		confirm = { label: "Confirm" }
	},
	placeholder,
	options,
	text,
	initialValue
}: SelectDialogDesc): Promise<DialogResult.Cancel | string> => {
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
				<SelectModal
					actions={{ cancel, confirm }}
					initialValue={ initialValue }
					onCancel={ onCancel }
					onConfirm={ onConfirm }
					options={ options }
					placeholder={ placeholder }
					text={ text }
				/>
			),
			closeOnClickOutside: false,
			withCloseButton: false
		});
	});
};
