import { Button, Group, TextInput } from "@mantine/core";
import { ChangeEvent, FormEvent, FunctionComponent, KeyboardEvent, memo, useCallback, useState } from "react";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";

export type SaveGraphSetFormProps = {
	onSave: (name: string) => any;
};

export const SaveGraphSetForm: FunctionComponent<SaveGraphSetFormProps> = memo(function WrappedSaveGraphSetForm({
	onSave
}: SaveGraphSetFormProps) {
	const [name, setName] = useState<string>("");
	const [error, setError] = useState<string | undefined>(undefined);

	const onNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setName(replaceInvalidNameChars(e.target.value));
		if (error && e.target.value?.length) setError(undefined);
	};

	const onSaveSet = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName?.length) {
			setError("Please provide a valid name");
		} else {
			setError(undefined);
			onSave(trimmedName);
			setName("");
		}
	};

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
		if (!keyEventIsValidForName(e)) {
			e.preventDefault();
		}
	}, []);

	return (
		<form onSubmit={ onSaveSet } >
			<Group gap="xs" align="flex-end">
				<TextInput
					label="Create Graph"
					description="Save the current state as a new graph"
					placeholder="Name"
					value={ name }
					error={ error || undefined }
					onChange={ onNameChange }
					onKeyDown={ onKeyDown }
					style={{ flex: 1 }}
					size="sm"
				/>
				<Button variant="outline" size="sm" type="submit">Save</Button>
			</Group>
		</form>
	);
});
