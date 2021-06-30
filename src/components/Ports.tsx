import { useState } from "react";
import { useSelector } from "react-redux";
import { RootStateType } from "../reducers";
import { EntityType } from "../reducers/entities";

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

	const inports = useSelector((state: RootStateType) => state.entities[EntityType.InportRecord]);

	const inportEntryElements = inports.map(inport => {
		return <InportEntry name={inport.name} key={inport.name} onSend={e => onSend(inport.name, e)} />
	}).valueSeq();

	return (
		<div className="ports">
			{inportEntryElements}
		</div>
	)
}
