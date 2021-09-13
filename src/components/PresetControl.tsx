import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { getPresets } from "../selectors/entities";
import { sendPresetToRemote, savePresetToRemote } from "../actions/device";
import { RootStateType } from "../lib/store"

type PresetState = {
	selectedPreset: string,
	newPresetName: string
}

const mapStateToProps = (state: RootStateType) => ({
	presets: getPresets(state)
});

const dispatchProps = {
	sendPreset: name => sendPresetToRemote(name),
	savePreset: name => savePresetToRemote(name)
  };

  const connector = connect(mapStateToProps, dispatchProps)

// The inferred type will look like:
// {isOn: boolean, toggleOn: () => void}
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {}



class PresetControl extends React.Component<Props, PresetState> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selectedPreset: "",
			newPresetName: ""
		}
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
		console.log(presets);
		return (
			<>
				<div>
					<select name="presets" id="presets" value={this.state.selectedPreset} onChange={this.handleSelect}>
						{
							presets.map(p => <option key={p.id} value={p.name}>{p.name}</option>)
						}
					</select>
					<button id="load" onClick={this.loadPreset}> Load </button>
					<form className="savePreset" onSubmit={this.handleSave}>
						<div className="inportLabel">
							<label> Name of new preset: </label>
						</div>
						<div className="newPresetInput">
							<input type="text" value={this.state.newPresetName} onChange={this.handleChange}></input>
							<input type="submit" value="Send" />
						</div>
					</form>
				</div>
			</>
		)
	}
};

export default connector(PresetControl);
