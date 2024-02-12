import React, { ChangeEvent, FormEvent, FunctionComponent, memo, useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Button, NativeSelect, Popover, Stack, Tabs, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPlus, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { SetRecord } from "../../models/set";
import classes from "./sets.module.css";
import { Map as ImmuMap } from "immutable";

enum ActiveView {
	Load = "load",
	Save = "save"
}

export type LoadSetProps = {
	onLoad: (set: SetRecord) => any;
	sets: ImmuMap<SetRecord["id"], SetRecord>
}

const LoadSet: FunctionComponent<LoadSetProps> = memo(function WrappedLoadSet({
	onLoad,
	sets
}) {

	const [selectedSet, setSelectedSet] = useState<SetRecord | undefined>();

	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => setSelectedSet(sets.get(e.target.value) || undefined);

	const loadSet = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (!selectedSet) return;
		onLoad(selectedSet);
	};

	return (
		<form onSubmit={ loadSet } >
			<Stack gap="xs">
				<NativeSelect
					name="set"
					id="set"
					label="Load Set"
					description="Select the set to load"
					onChange={ handleSelect }
					data-autofocus
					value={ selectedSet?.id || "" }
					data={ [
						{ value: "", disabled: true, label: "Select" },
						...(sets?.valueSeq().map((p: SetRecord) => ({ label: p.name, value: p.id })).toArray() || []).toSorted((a, b) => a.label.localeCompare(b.label, "en"))
					] }
				/>
				<Button variant="outline" size="sm" type="submit">
					Load
				</Button>
			</Stack>
		</form>
	);
});

interface SaveSetProps {
	onSave: (name: string) => any;
}

const SaveSet: FunctionComponent<SaveSetProps> = memo(function WrappedSaveSet({ onSave }: SaveSetProps) {
	const [name, setName] = useState<string>("");
	const [error, setError] = useState<string | undefined>(undefined);

	const onNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setName(e.target.value);
		if (error && e.target.value?.length) setError(undefined);
	};

	const onSaveSet = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (!name?.length) {
			setError("Please provide a valid set name");
		} else {
			setError(undefined);
			onSave(name);
			setName("");
		}
	};

	return (
		<form onSubmit={ onSaveSet } >
			<Stack gap="xs">
				<TextInput
					label="Create Set"
					description="Name the new set"
					placeholder="Set Name"
					value={ name }
					error={ error || undefined }
					onChange={ onNameChange }
				/>
				<Button variant="outline" size="sm" type="submit">Save</Button>
			</Stack>
		</form>
	);
});

export type SetControlProps = {
	onLoadSet: (set: SetRecord) => any;
	onSaveSet: (name: string) => any;
	sets: ImmuMap<SetRecord["id"], SetRecord>
};


const SetControl: FunctionComponent<SetControlProps> = memo(function WrappedSetControl({
	onLoadSet,
	onSaveSet,
	sets
}) {

	const [activeView, setActiveView] = useState<ActiveView>(ActiveView.Load);
	const [opened, { close, toggle }] = useDisclosure();

	const onTabChange = (tab: ActiveView) => setActiveView(tab);

	const onTriggerLoadSet = (set: SetRecord): void => {
		onLoadSet(set);
		close();
	};

	const onTriggerSaveSet = (name: string): void => {
		onSaveSet(name);
		close();
	};

	useEffect(() => {
		if (!opened && activeView !== ActiveView.Load) setActiveView(ActiveView.Load);
	}, [opened, activeView, setActiveView]);

	return (
		<Popover onClose={ close } opened={ opened } width={ 300 } trapFocus position="bottom-end" withArrow arrowPosition="side" shadow="sm">
			<Popover.Target>
				<Button
					onClick={ toggle }
					size="xs"
					variant={ opened ? "light" : "default" }
					leftSection={ <FontAwesomeIcon icon={ faCamera } /> }
				>
					Sets
				</Button>
			</Popover.Target>
			<Popover.Dropdown>
				<Tabs value={ activeView } onChange={ onTabChange } >
					<Tabs.List grow>
						<Tabs.Tab leftSection={ <FontAwesomeIcon icon={ faRotateRight } /> } value={ ActiveView.Load }>Load</Tabs.Tab>
						<Tabs.Tab leftSection={ <FontAwesomeIcon icon={ faPlus } /> } value={ ActiveView.Save }>Create</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value={ ActiveView.Load } className={ classes.setTabWrap } >
						<LoadSet onLoad={ onTriggerLoadSet } sets={ sets } />
					</Tabs.Panel>
					<Tabs.Panel value={ ActiveView.Save } className={ classes.setTabWrap } >
						<SaveSet onSave={ onTriggerSaveSet } />
					</Tabs.Panel>
				</Tabs>
			</Popover.Dropdown>
		</Popover>
	);
});

export default SetControl;
