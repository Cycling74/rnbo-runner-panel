import { Button, Group, TextInput } from "@mantine/core";
import { ChangeEvent, FormEvent, FunctionComponent, memo, useState } from "react";

export type SavePresetFormProps = {
	onSave: (name: string) => any;
};

export const SavePresetForm: FunctionComponent<SavePresetFormProps> = memo(function WrappedSavePresetForm({
	onSave
}: SavePresetFormProps) {

	const [name, setName] = useState<string>("");
	const [error, setError] = useState<string | undefined>(undefined);

	const onNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setName(e.target.value);
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
				/>
				<Button variant="outline" size="sm" type="submit">Save</Button>
			</Group>
		</form>
	);
});
