import { Anchor, Button, Group, Modal, Stack, Text, TextInput, Textarea, Tooltip } from "@mantine/core";
import { ChangeEvent, FC, FormEvent, memo, useCallback, useEffect, useState } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { JsonMap } from "../../lib/types";
import { MetadataScope } from "../../lib/constants";
import { parseMetaJSONString } from "../../lib/util";
import classes from "./metaEditorModal.module.css";
import { IconElement } from "../elements/icon";
import { mdiClose, mdiCodeBraces } from "@mdi/js";
import { ConfirmDialogResult, showConfirmDialog } from "../../lib/dialogs";

export type MetaEditorModalProps = {
	name: string;
	meta: string;
	onClose: () => any;
	onRestore?: () => any;
	onSaveMeta: (meta: string) => any;
	scope: MetadataScope;
};

const scopeLabels: Record<MetadataScope, { nameField: { name: string; label: string; }; restoreTooltip: string; title: string; }> = {
	[MetadataScope.Inport]: {
		nameField: {
			name: "inport_name",
			label: "Inport Name"
		},
		restoreTooltip: "Restore the default value that has been set on the [inport] object at export time",
		title: "Edit Inport Metadata"
	},
	[MetadataScope.Outport]: {
		nameField: {
			name: "outport_name",
			label: "Outport Name"
		},
		restoreTooltip: "Restore the default value that has been set on the [outport] object at export time",
		title: "Edit Outport Metadata"
	},
	[MetadataScope.Parameter]: {
		nameField: {
			name: "parameter_name",
			label: "Parameter Name"
		},
		restoreTooltip: "Restore the default value that has been set on the [param] object at export time",
		title: "Edit Parameter Metadata"
	}
};

export const MetaEditorModal: FC<MetaEditorModalProps> = memo(function WrappedParamMetaEditorModal({
	meta,
	name,
	onClose,
	onRestore,
	onSaveMeta,
	scope
}) {

	const [initialValue, setInitialValue] = useState<string | undefined>(undefined);
	const [value, setValue] = useState<string>(meta);
	const [error, setError] = useState<Error | undefined>();
	const [hasChanges, setHasChanges] = useState<boolean>(false);

	useEffect(() => {
		if (initialValue === undefined || meta === initialValue) return void setInitialValue(meta);

		if (!hasChanges) {
			setInitialValue(meta);
			setValue(meta);
			return;
		}

		showConfirmDialog({
			text: "The meta data has been updated on the runner. Should any local changes be overwritten by the new remote value?",
			actions: {
				confirm: { label: "Overwrite Changes" },
				cancel: { label: "Keep Unsaved Changes" }
			}
		}).then((result: ConfirmDialogResult) => {

			if (result === ConfirmDialogResult.Confirm) {
				setError(undefined);
				setInitialValue(meta);
				setValue(meta);
				setHasChanges(false);
			} else {
				setInitialValue(meta);
			}
		});
	}, [meta, initialValue, setInitialValue, setValue, hasChanges, setHasChanges, setError]);

	const showFullScreen = useIsMobileDevice();

	const onTriggerClose = useCallback(async () => {
		if (hasChanges) {
			const result = await showConfirmDialog({
				text: "The meta data has unsaved changes. Are you sure you want to discard them?",
				actions: {
					confirm: { label: "Discard Changes", color: "red" }
				}
			});

			if (result === ConfirmDialogResult.Confirm) {
				// Discard unsaved changes
				onClose();
			}
		} else {
			onClose();
		}
	}, [onClose, hasChanges]);

	const onCancel = useCallback(async () => {

		if (hasChanges) {
			const result = await showConfirmDialog({
				text: "The meta data has unsaved changes. Are you sure you want to discard them?",
				actions: {
					confirm: { label: "Discard Changes", color: "red" }
				}
			});

			if (result === ConfirmDialogResult.Confirm) {
				// Discard unsaved changes
				setValue(meta);
				setHasChanges(false);

				try {
					if (meta) parseMetaJSONString(meta); // ensure valid
					setError(undefined);
				} catch (err: unknown) {
					setError(err instanceof Error ? err : new Error("Invalid JSON format."));
				}
			}
		} else {
			setValue(meta);
			setHasChanges(false);
			try {
				parseMetaJSONString(meta); // ensure valid
				setError(undefined);
			} catch (err: unknown) {
				setError(err instanceof Error ? err : new Error("Invalid JSON format."));
			}
		}
	}, [setValue, hasChanges, setHasChanges, meta, setError]);

	const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		if (error) {
			try {
				const v = e.currentTarget.value;
				if (v) parseMetaJSONString(v); // ensure valid
				setError(undefined);
			} catch (err: unknown) {
				setError(err instanceof Error ? err : new Error("Invalid JSON format."));
			}
		}
		setValue(e.currentTarget.value);
		setHasChanges(true);
	}, [setValue, setHasChanges, error, setError]);

	const onInputBlur = useCallback(() => {
		try {
			if (value) {
				const j: JsonMap = parseMetaJSONString(value); // ensure valid
				setValue(JSON.stringify(j, null, 2));
			}
			setError(undefined);
		} catch (err: unknown) {
			setError(err instanceof Error ? err : new Error("Invalid JSON format."));
		}
	}, [value, setError, setValue]);

	const onSaveValue = useCallback((e: FormEvent) => {
		e.preventDefault();
		try {
			if (value) parseMetaJSONString(value); // ensure valid
			setHasChanges(false);
			onSaveMeta(value);
		} catch (err: unknown) {
			setError(err instanceof Error ? err : new Error("Invalid JSON format."));
		}
	}, [setError, setHasChanges, onSaveMeta, value]);

	const onTriggerRestore = useCallback(async () => {
		const result = await showConfirmDialog({
			text: "Are you sure you want to restore the default metadata value? This action cannot be undone.",
			actions: {
				confirm: { label: "Restore Defaults" }
			}
		});

		if (result === ConfirmDialogResult.Confirm) {
			onRestore();
		}
	}, [onRestore]);

	const uiLabels = scopeLabels[scope];

	return (
		<Modal.Root opened onClose={ onTriggerClose } fullScreen={ showFullScreen } size="xl">
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>
						<Group gap="xs">
							<IconElement path={ mdiCodeBraces } />
							{ uiLabels.title }
						</Group>
					</Modal.Title>
					<Modal.CloseButton />
				</Modal.Header>
				<Modal.Body>
					<Stack gap="lg">
						<Text fz="sm" c="dimmed">
							Please refer to the <Anchor inherit href="https://rnbo.cycling74.com/learn/metadata" target="_blank">RNBO Documentation</Anchor> to learn more about Metadata.
						</Text>
						<Group justify="space-between" align="flex-end">
							<TextInput size="xs" readOnly label={ uiLabels.nameField.label } name={ uiLabels.nameField.name } value={ name } flex={ 1 } />
							{
								onRestore ? (
									<Tooltip label={ uiLabels.restoreTooltip } >
										<Button onClick={ onTriggerRestore } size="xs" variant="default">
											Restore Default
										</Button>
									</Tooltip>
								) : null
							}
						</Group>
						<form onSubmit={ onSaveValue } >
							<Stack gap="md">
								<Textarea
									label="Metadata"
									description="Metadata in JSON object format"
									autosize
									minRows={ 10 }
									onChange={ onInputChange }
									value={ value }
									error={ error?.message }
									onBlur={ onInputBlur }
									classNames={{ input: classes.textArea }}
								/>
								<Group justify="flex-end">
									<Button.Group>
										<Button
											variant="default"
											color="gray"
											disabled={ !hasChanges }
											leftSection={ <IconElement path={ mdiClose } /> }
											onClick={ onCancel }
										>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={ !hasChanges || !!error }
										>
											Save
										</Button>
									</Button.Group>
								</Group>
							</Stack>
						</form>
					</Stack>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});
