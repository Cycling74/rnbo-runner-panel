import { Button, Group, Modal, Select, Stack, Text, Textarea } from "@mantine/core";
import { ChangeEvent, FC, FormEvent, memo, useCallback, useRef, useState } from "react";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { OrderedSet } from "immutable";
import { ParameterRecord } from "../../models/parameter";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { modals } from "@mantine/modals";
import { AnyJson } from "../../lib/types";

export type ParamMetaEditorModalProps = {
	onClose: () => any;
	onSaveParameterMeta: (param: ParameterRecord, meta: string) => any;
	parameters: OrderedSet<ParameterRecord>;
};

export const ParamMetaEditorModal: FC<ParamMetaEditorModalProps> = memo(function WrappedParamMetaEditorModal({
	onClose,
	onSaveParameterMeta,
	parameters
}) {

	const [hasChanges, setHasChanges] = useState<boolean>(false);
	const [value, setValue] = useState<string | undefined>(parameters.first()?.meta);
	const [error, setError] = useState<Error | undefined>();
	const [activeParam, setActiveParam] = useState<ParameterRecord | undefined>(parameters.first());
	const selectRef = useRef<HTMLInputElement>();

	const showFullScreen = useIsMobileDevice();

	const onTriggerClose = useCallback(() => {
		if (hasChanges) {
			modals.openConfirmModal({
				title: "Unsaved Changes",
				centered: true,
				children: (
					<Text size="sm" id="red">
						The meta data of parameter {`'${activeParam.name}'`} has unsaved changes. Are you sure you want to discard them?
					</Text>
				),
				labels: { confirm: "Discard", cancel: "Cancel" },
				confirmProps: { color: "red" },
				onConfirm: () => onClose()
			});
		} else {
			onClose();
		}
	}, [onClose, activeParam, hasChanges]);

	const onSelectParam = useCallback((id: string) => {
		const p = parameters.find(p => p.id === id);
		if (!p || id === activeParam.id) return;
		if (!hasChanges) {
			setActiveParam(p);
			setValue(p.meta);
			setHasChanges(false);
			selectRef.current?.blur();
		} else {
			selectRef.current?.blur();
			modals.openConfirmModal({
				title: "Unsaved Changes",
				centered: true,
				children: (
					<Text size="sm" id="red">
						The meta data of parameter {`'${activeParam.name}'`} has unsaved changes. Are you sure you want to discard them?
					</Text>
				),
				labels: { confirm: "Discard", cancel: "Cancel" },
				confirmProps: { color: "red" },
				onConfirm: () => {
					setActiveParam(p);
					setValue(p.meta);
					setHasChanges(false);
				}
			});
		}
	}, [parameters, activeParam, setActiveParam, setValue, hasChanges, setHasChanges, selectRef]);

	const onReset = useCallback(() => {
		setValue(activeParam?.meta || "");
		setHasChanges(false);
	}, [setValue, setHasChanges, activeParam]);

	const onInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
		if (error) {
			try {
				JSON.parse(e.currentTarget.value); // ensure valid
				setError(undefined);
			} catch (err) {
				setError(new Error("Invalid JSON."));
			}
		}
		setValue(e.currentTarget.value);
		setHasChanges(true);
	}, [setValue, setHasChanges, error, setError]);

	const onInputBlur = useCallback(() => {
		try {
			const j: AnyJson = JSON.parse(value); // ensure valid
			setValue(JSON.stringify(j, null, 2));
			setError(undefined);
		} catch (err) {
			setError(new Error("Invalid JSON."));
		}
	}, [value, setError, setValue]);

	const onSaveValue = useCallback((e: FormEvent) => {
		e.preventDefault();
		try {
			JSON.parse(value); // ensure valid
			setHasChanges(false);
			onSaveParameterMeta(activeParam, value);
		} catch (err) {
			setError(new Error("Invalid JSON."));
		}
	}, [setError, setHasChanges, activeParam, value]);


	return (
		<Modal.Root opened onClose={ onTriggerClose } fullScreen={ showFullScreen } size="xl">
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Modal.Title>Edit Parameter Meta</Modal.Title>
					<Modal.CloseButton />
				</Modal.Header>
				<Modal.Body>
					<form onSubmit={ onSaveValue } >
						<Stack gap="md">
							<Select
								data={ parameters.valueSeq().toArray().map(p => ({ label: p.name, value: p.id })) }
								name="parameter_id"
								label="Parameter"
								description="Select the parameter of which you'd like to edit the meta data"
								onChange={ onSelectParam }
								value={ activeParam.id }
								allowDeselect={ false }
								searchable
								nothingFoundMessage="Parameter not found..."
								ref={ selectRef }
							/>
							<Textarea
								label="Parameter Meta Data"
								description="Parameter meta data as JSON"
								placeholder="{}"
								autosize
								minRows={ 10 }
								onChange={ onInputChange }
								value={ value }
								error={ error?.message }
								onBlur={ onInputBlur }
							/>
							<Group justify="flex-end">
								<Button.Group>
									<Button
										variant="light"
										color="gray"
										disabled={ !hasChanges }
										leftSection={ <FontAwesomeIcon icon={ faXmark } /> }
										onClick={ onReset }
									>
										Reset
									</Button>
									<Button
										type="submit"
										disabled={ !hasChanges }
									>
										Save
									</Button>
								</Button.Group>
							</Group>
						</Stack>
					</form>
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});
