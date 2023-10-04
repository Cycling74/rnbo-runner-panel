import { useCallback } from "react";
import { sendListToRemoteInport } from "../../actions/device";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { getInports } from "../../selectors/entities";
import InportEntry from "./inport";

export default function Ports() {

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
	);
}
