import React, { FormEvent, memo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { getPresets } from "../selectors/entities";
import { RootStateType } from "../lib/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { PresetRecord } from "../models/preset";
import { sendPresetToRemote, savePresetToRemote } from "../actions/device";

interface StyledProps {
	open: boolean;
}

const PresetWrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	position: relative;
	padding-right: 2rem;
	color: ${({ theme }) => theme.colors.lightNeutral};

	@media (max-width: 769px) {
		padding-right: 0;
	}
`;

const OpenButton = styled.button`
	padding: 0.6rem;
	border-radius: 8px;
	border-style: none;

	background-color: ${({ theme }) => theme.colors.primary};
	color: ${({ theme }) => theme.colors.lightNeutral};
	text-align: center;
	cursor: pointer;

	svg {
		margin-left: 0.5rem;
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.secondary};
	}
`;

const PresetPanel = styled.div<StyledProps>`
	position: absolute;
	top: 100%;
	display: ${({ open }) => open ? "flex" : "none"};
	flex-direction: column;
	background-color: ${({ theme }) => theme.colors.primary};
	border-radius: 8px;
	border-style: none;
	padding: 1rem;
	z-index: 8;
`;

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
	const [showPresets, setShowPresets] = useState(false);
	const dispatch = useAppDispatch();

	useEffect(() => {
		setPresetList(presets);
	}, [presets]);

	const openPresets = (): void => {
		setShowPresets(!showPresets);
	};

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
		<PresetWrapper>
			<OpenButton onClick={openPresets}>
				Presets
				{showPresets ? <FontAwesomeIcon icon="angle-up" /> : <FontAwesomeIcon icon="angle-down" />}
			</OpenButton>
			<PresetPanel open={showPresets}>
				<PresetSelection>
					<select name="presets" id="presets" defaultValue="" onChange={handleSelect}>
						<option disabled value="" hidden={selectedPreset ? true : false}>
							Select a preset:
						</option>
						{
							presetList && presetList.valueSeq().map(p => <option key={p.id} value={p.name}>{p.name}</option>)
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
			</PresetPanel>
		</PresetWrapper>
	);
});

export default PresetControl;
