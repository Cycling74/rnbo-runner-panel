import { useCallback, useState } from "react";
import { sendListToRemoteInport } from "../actions/device";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { getInports } from "../selectors/entities";


type InportEntryProps = {
	name: string;
	onSend: (name: string, value: string) => any;
};

function InportEntry({ name, onSend }: InportEntryProps) {

	const [text, setText] = useState("");

	const handleChange = (event) => {
		setText(event.target.value);
	}

	const handleSubmit = (event) => {
		event.preventDefault();
		if (onSend) onSend(name, text);
	}

	return (
		<form className="inport" onSubmit={handleSubmit}>
			<div className="inportLabel">
				<label>{name}</label>
			</div>
			<div className="inportInput">
				<input type="text" value={text} onChange={handleChange}></input>
				<input className="smallButton" type="submit" value="Send"/>
			</div>
		</form>
	);
}


export type PortsProps = {};

export default function Ports({}: PortsProps) {

	const dispatch = useAppDispatch();
	const onSend = useCallback((name: string, textValue: string) => {
		const values = textValue.split(/\s+/).map(s => parseFloat(s));
		dispatch(sendListToRemoteInport(name, values));
	}, [dispatch]);

	const inports = useAppSelector(state => getInports(state));

	return (
		<div className="ports">
			{
				inports.valueSeq().map(inport => <InportEntry name={inport.name} key={inport.name} onSend={ onSend } />)
			}
		</div>
	)
}
