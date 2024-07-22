import { Button, Group, TextInput } from "@mantine/core";
import { ChangeEvent, FormEvent, FunctionComponent, KeyboardEvent, memo, useCallback, useState } from "react";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";

export type SavePresetFormProps = {
	onSave: (name: string) => any;
};

export const SavePresetForm: FunctionComponent<SavePresetFormProps> = memo(function WrappedSavePresetForm({
	onSave
}: SavePresetFormProps) {

	const [name, setName] = useState<string>("");
	const [error, setError] = useState<string | undefined>(undefined);

	const onNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setName(replaceInvalidNameChars(e.target.value));
		if (error && e.target.value?.length) setError(undefined);
	};

	const onSavePreset = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (!name?.length) {
			setError("Please provide a valid preset name");
		} else {
			setError(undefined);
			onSave(name);
			setName("");
		}
	};

	const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
		if (!keyEventIsValidForName(e)) {
			e.preventDefault();
		}
	}, []);

	return (
		<form onSubmit={ onSavePreset } >
			<Group gap="xs" align="flex-end">
				<TextInput
					label="Create Preset"
					description="Save the current parameter state as a new preset"
					placeholder="Name"
					value={ name }
					error={ error || undefined }
					onChange={ onNameChange }
					style={{ flex: 1 }}
					size="sm"
					onKeyDown={ onKeyDown }
				/>
				<Button variant="outline" size="sm" type="submit">
					Save
				</Button>
			</Group>
		</form>
	);
});
