import { useContext, useState } from "react";
import { DeviceContext } from "../contexts/device";

function InportEntry({ name, onSend }) {

	const [text, setText] = useState("");

	const handleChange = (event) => {
		setText(event.target.value);
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		if (onSend) onSend(text);
	}

	return (
		<form className="inport" onSubmit={handleSubmit}>
			<div className="inportLabel">
				<label>{name}</label>
			</div>
			<div className="inportInput">
				<input type="text" value={text} onChange={handleChange}></input>
				<input type="submit" value="Send"/>
			</div>
		</form>
	);
}

export default function Ports({ onSend }) {

	const { device } = useContext(DeviceContext);

	const inports = !device ? [] : device.get("inports", []).map(inport => {
		return <InportEntry name={inport.name} key={inport.name} onSend={e => onSend(inport.name, e)} />
	})

	return (
		<div className="ports">
			{inports}
		</div>
	)
}
