import React, { FormEvent, memo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { getPresets } from "../selectors/entities";
import { sendPresetToRemote, savePresetToRemote } from "../actions/device";
import { RootStateType } from "../lib/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import { PresetRecord } from "../models/preset";

interface StyledProps {
	shown: boolean;
}

const PresetWrapper = styled.div`
	color: ${({ theme }) => theme.colors.lightNeutral};
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	padding-right: 2rem;
	position: relative;

	@media (max-width: 769px) {
		padding-right: 0;
	}

	.presetPanel {
		position: absolute;
		top: 100%;
		display: ${(props: StyledProps) => props.shown ? "flex" : "none"};
		flex-direction: column;
		background-color: ${({ theme }) => theme.colors.primary};
		border-radius: 8px;
		border-style: none;
		padding: 1rem;
		z-index: 8;

		.savePresetGroup {
			padding-top: 0.5rem;

			.saveLabel {
				font-size: 0.75rem;
			}
		}
	}

	.open {
		background-color: ${({ theme }) => theme.colors.primary};
		color: ${({ theme }) => theme.colors.lightNeutral};
		border-radius: 8px;
		border-style: none;
		padding: .6rem;
		text-align: center;
		cursor: pointer;
		#chev {
			margin-left: 0.5rem;
		}
		&:hover {
			background-color: ${({ theme }) => theme.colors.secondary};
		}
	}
`;

const PresetControl = memo(function WrappedPresetControl(): JSX.Element {

	const presets = useAppSelector((state: RootStateType) => getPresets(state));
	const [selectedPreset, setSelectedPreset] = useState(presets.size > 0 ? (presets.first() as PresetRecord).name : "");
	const [newPresetName, setNewPresetName] = useState("");
	const [showPresets, setShowPresets] = useState(false);
	const dispatch = useAppDispatch();

	const openPresets = (): void => {
		setShowPresets(!showPresets);
	};

	const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
		setSelectedPreset(e.target.value);
	};

	const loadPreset = (): void => {
		// Send Value to remote
		dispatch(sendPresetToRemote(selectedPreset));
	};

	const handleSave = (e: FormEvent): void => {
		dispatch(savePresetToRemote(newPresetName));
		e.preventDefault();
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setNewPresetName(e.target.value);
	};

	return (
		<PresetWrapper shown={showPresets} >
			<button className="open" type="button" onClick={openPresets}>
				Presets <FontAwesomeIcon id="chev" icon="angle-down" />
			</button>
			<div className="presetPanel">
				<div>
					<select name="presets" id="presets" value={selectedPreset} onChange={handleSelect}>
						{
							presets.valueSeq().map(p => <option key={p.id} value={p.name}>{p.name}</option>)
						}
					</select>
					<button className="smallButton" id="load" onClick={loadPreset}> Load </button>
				</div>
				<form className="savePresetGroup" onSubmit={ handleSave } >
					<div className="saveLabel">
						<label> Name of new preset: </label>
					</div>
					<div className="newPresetInput">
						<input type="text" value={newPresetName} onChange={handleChange}></input>
						<input className="smallButton" type="submit" value="Save" />
					</div>
				</form>
			</div>
		</PresetWrapper>
	);
});

export default PresetControl;
