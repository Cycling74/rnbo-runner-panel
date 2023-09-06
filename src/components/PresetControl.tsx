import React, { FormEvent, memo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { getPresets } from "../selectors/entities";
import { RootStateType } from "../lib/store";
import styled from "styled-components";
import { sendPresetToRemote, savePresetToRemote } from "../actions/device";

interface Preset {
	id: string;
	name: string;
}

const PresetSelection = styled.div`
	padding-bottom: 0.5rem;
`;

const SavePresetForm = styled.form`
	label {
		font-size: 0.75rem;
	}
`;

const PresetControl = memo(function WrappedPresetControl(): JSX.Element {
	const presets = useAppSelector((state: RootStateType) => getPresets(state));
	const [presetList, setPresetList] = useState(null);
	const [selectedPreset, setSelectedPreset] = useState("");
	const [newPresetName, setNewPresetName] = useState("");
	const dispatch = useAppDispatch();

	useEffect(() => {
		setPresetList(presets);
	}, [presets]);

	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
		setSelectedPreset(e.target.value);
	};

	const loadPreset = (): void => { dispatch(sendPresetToRemote(selectedPreset)); };

	const handleSave = (e: FormEvent): void => {
		dispatch(savePresetToRemote(newPresetName));

		// Refresh presets list
		// Set selectedPreset to that preset

		e.preventDefault();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setNewPresetName(e.target.value);
	};

	return (
		<>
			<PresetSelection>
				<select name="presets" id="presets" defaultValue="" onChange={handleSelect}>
					<option disabled value="" hidden={selectedPreset ? true : false}>
						Select a preset:
					</option>
					{
						presetList &&
							presetList.valueSeq().map((p: Preset) => <option key={p.id} value={p.name}>{p.name}</option>)
					}
				</select>
				<button onClick={loadPreset}>
					Load
				</button>
			</PresetSelection>
			<SavePresetForm onSubmit={handleSave}>
				<label>Name of new preset:</label>
				<input type="text" value={newPresetName} onChange={handleChange}></input>
				<input type="submit" value="Save" />
			</SavePresetForm>
		</>
	);
});

export default PresetControl;
