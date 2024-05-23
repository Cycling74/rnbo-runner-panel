import { FunctionComponent, memo } from "react";
import classes from "./datarefs.module.css";
import { TextInput } from "@mantine/core";

interface DataRefEntryProps {
	id: string;
	value: string;
}

const DataRefEntry: FunctionComponent<DataRefEntryProps> = memo(function WrappedDataRefEntry({ id, value }) {

	return (
		<div className={ classes.dataref } >
			<TextInput
				label={ id }
				size="sm"
				readOnly
				value={ value }
			/>
		</div>
	);
});

export default DataRefEntry;
