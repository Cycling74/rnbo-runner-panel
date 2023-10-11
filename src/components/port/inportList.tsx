import { useCallback } from "react";
import { sendListToRemoteInport } from "../../actions/device";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { getInports } from "../../selectors/entities";
import InportEntry from "./inport";
import classes from "./ports.module.css";
import { Stack } from "@mantine/core";

export default function InportList() {

	const dispatch = useAppDispatch();
	const onSend = useCallback((name: string, textValue: string) => {
		const values = textValue.split(/\s+/).map(s => parseFloat(s));
		dispatch(sendListToRemoteInport(name, values));
	}, [dispatch]);

	const inports = useAppSelector(state => getInports(state));

	return (
		<Stack className={ classes.portList } gap="md">
			{
				inports.valueSeq().map(inport => <InportEntry name={inport.name} key={inport.name} onSend={ onSend } />)
			}
		</Stack>
	);
}
