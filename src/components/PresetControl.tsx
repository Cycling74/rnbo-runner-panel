import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { getPresets } from "../selectors/entities";
import { sendPresetToRemote, savePresetToRemote } from "../actions/device";
import { RootStateType } from "../lib/store"
import styled from "styled-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const PresetWrapper = styled.div`
	z-index: 100;
	color: #F6F6F6;
	.presetPanel {
		position: absolute;
		display: ${props => props.shown ? "flex" : "none"};
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		background-color: #21496D;
		border-radius: 8px;
		border-style: none;
		padding: .5rem 1rem;
	}

	.open {
		background-color: #21496D;
		color: #F6F6F6;
		border-radius: 8px;
		border-style: none;
		padding: .5rem;
  		text-align: center;
		cursor: pointer;
		#chev {
			margin-left: 0.5rem;
		}
		&:hover {
			background-color: #d1d86c;
		}
	}

`;

type PresetState = {
	selectedPreset: string,
	newPresetName: string,
	showPresets: boolean
}

const mapStateToProps = (state: RootStateType) => ({
	presets: getPresets(state)
});

const dispatchProps = {
	sendPreset: name => sendPresetToRemote(name),
	savePreset: name => savePresetToRemote(name)
  };

const connector = connect(mapStateToProps, dispatchProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {}


class PresetControl extends React.Component<Props, PresetState> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selectedPreset: "",
			newPresetName: "",
			showPresets: false
		}
	}

	openPresets = () => {
		let show = !(this.state.showPresets)
		this.setState({
			showPresets: show
		})
	}

	handleSelect = (e) => {
		this.setState({
			selectedPreset: e.target.value
		});
	}

	loadPreset = () => {
		// Send Value to remote
		let name = this.state.selectedPreset;
		this.props.sendPreset(name);
	}

	handleSave = () => {
		let newName = this.state.newPresetName;
		this.props.savePreset(newName);
	}

	handleChange = (e) => {
		this.setState({
			newPresetName: e.target.value
		});
	}

	render() {
		const presets = this.props.presets;
		return (
			<>
				<PresetWrapper shown={this.state.showPresets} >
					<button className="open" type="button" onClick={this.openPresets}>
						Presets <FontAwesomeIcon id="chev" icon="angle-down" />
					</button>
					<div className="presetPanel">
						<div>
							<select name="presets" id="presets" value={this.state.selectedPreset} onChange={this.handleSelect}>
								{
									presets.map(p => <option key={p.id} value={p.name}>{p.name}</option>)
								}
							</select>
							<button id="load" onClick={this.loadPreset}> Load </button>
						</div>
						<form className="savePreset" onSubmit={this.handleSave}>
							<div className="inportLabel">
								<label> Name of new preset: </label>
							</div>
							<div className="newPresetInput">
								<input type="text" value={this.state.newPresetName} onChange={this.handleChange}></input>
								<input type="submit" value="Save" />
							</div>
						</form>
					</div>
				</PresetWrapper>
			</>
		)
	}
};

export default connector(PresetControl);
