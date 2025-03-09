import { ChangeEvent, FC, FormEvent, KeyboardEvent, memo, useCallback, useState } from "react";
import { keyEventIsValidForName, replaceInvalidNameChars } from "../../lib/util";
import { Button, Group, TextInput } from "@mantine/core";

export type CreateSetViewFormProps = {
	onSave: (name: string) => any;
};

export const CreateSetViewForm: FC<CreateSetViewFormProps> = memo(function WrappedCreateSetViewForm({
	onSave
}: CreateSetViewFormProps) {

	const [name, setName] = useState<string>("");
	const [error, setError] = useState<string | undefined>(undefined);

	const onNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setName(replaceInvalidNameChars(e.target.value));
		if (error && e.target.value?.length) setError(undefined);
	};

	const onSaveSetView = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName?.length) {
			setError("Please provide a valid SetView name");
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
		<form onSubmit={ onSaveSetView } >
			<Group gap="xs" align="flex-end">
				<TextInput
					label="Create Parameter View"
					description="Create a new view with the given name"
					placeholder="Name"
					value={ name }
					error={ error || undefined }
					onChange={ onNameChange }
					style={{ flex: 1 }}
					size="sm"
					onKeyDown={ onKeyDown }
				/>
				<Button variant="outline" size="sm" type="submit">
					Create
				</Button>
			</Group>
		</form>
	);
});
