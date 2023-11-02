import React, { ChangeEvent, FormEvent, FunctionComponent, memo, useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Button, NativeSelect, Popover, Stack, Tabs, TextInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPlus, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { PresetRecord } from "../../models/preset";
import classes from "./presets.module.css";
import { DeviceStateRecord } from "../../models/device";

enum ActiveView {
	Load = "load",
	Save = "save"
}

export type LoadPresetProps = {
	onLoad: (preset: PresetRecord) => any;
	presets: DeviceStateRecord["presets"];
}

const LoadPreset: FunctionComponent<LoadPresetProps> = memo(function WrappedLoadPreset({
	onLoad,
	presets
}) {

	const [selectedPreset, setSelectedPreset] = useState<PresetRecord | undefined>();

	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => setSelectedPreset(presets.get(e.target.value) || undefined);

	const loadPreset = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (!selectedPreset) return;
		onLoad(selectedPreset);
	};

	return (
		<form onSubmit={ loadPreset } >
			<Stack gap="xs">
				<NativeSelect
					name="preset"
					id="preset"
					label="Load Preset"
					description="Select the preset to load"
					onChange={ handleSelect }
					data-autofocus
					value={ selectedPreset?.id || "" }
					data={ [
						{ value: "", disabled: true, label: "Select" },
						...(presets?.valueSeq().map((p: PresetRecord) => ({ label: p.name, value: p.id })).toArray() || [])
					] }
				/>
				<Button variant="outline" size="sm" type="submit">
					Load
				</Button>
			</Stack>
		</form>
	);
});

interface SavePresetProps {
	onSave: (name: string) => any;
}

const SavePreset: FunctionComponent<SavePresetProps> = memo(function WrappedSavePreset({ onSave }: SavePresetProps) {
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
			<Stack gap="xs">
				<TextInput
					label="Create Preset"
					description="Name the new preset"
					placeholder="Preset Name"
					value={ name }
					error={ error || undefined }
					onChange={ onNameChange }
				/>
				<Button variant="outline" size="sm" type="submit">Save</Button>
			</Stack>
		</form>
	);
});

export type PresetControlProps = {
	onLoadPreset: (preset: PresetRecord) => any;
	onSavePreset: (name: string) => any;
	presets: DeviceStateRecord["presets"];
};


const PresetControl: FunctionComponent<PresetControlProps> = memo(function WrappedPresetControl({
	onLoadPreset,
	onSavePreset,
	presets
}) {

	const [activeView, setActiveView] = useState<ActiveView>(ActiveView.Load);
	const [opened, { close, toggle }] = useDisclosure();

	const onTabChange = (tab: ActiveView) => setActiveView(tab);

	const onTriggerLoadPreset = (preset: PresetRecord): void => {
		onLoadPreset(preset);
		close();
	};

	const onTriggerSavePreset = (name: string): void => {
		onSavePreset(name);
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
					Presets
				</Button>
			</Popover.Target>
			<Popover.Dropdown>
				<Tabs value={ activeView } onChange={ onTabChange } >
					<Tabs.List grow>
						<Tabs.Tab leftSection={ <FontAwesomeIcon icon={ faRotateRight } /> } value={ ActiveView.Load }>Load</Tabs.Tab>
						<Tabs.Tab leftSection={ <FontAwesomeIcon icon={ faPlus } /> } value={ ActiveView.Save }>Create</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value={ ActiveView.Load } className={ classes.presetTabWrap } >
						<LoadPreset onLoad={ onTriggerLoadPreset } presets={ presets } />
					</Tabs.Panel>
					<Tabs.Panel value={ ActiveView.Save } className={ classes.presetTabWrap } >
						<SavePreset onSave={ onTriggerSavePreset } />
					</Tabs.Panel>
				</Tabs>
			</Popover.Dropdown>
		</Popover>
	);
});

export default PresetControl;
