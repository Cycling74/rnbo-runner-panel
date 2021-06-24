import { ParameterRecord } from "../models/parameter";
import { memo } from "react";
import Parameter from "./Parameter";
import { OrderedMap } from "immutable";
import styles from "../../styles/Device.module.css"

type ParameterListProps = {
	parameters: OrderedMap<string, ParameterRecord>;
	onSetValue: (name: string, value: number) => void;
}

const ParameterList = memo(function WrappedParameterList({parameters, onSetValue}: ParameterListProps) {
	const parameterElements = parameters.map(p => {
		return <Parameter key={p.name} record={p} onSetValue={onSetValue} />
	});

	return (
		<>
			<h2>Parameters</h2>
			<div className={styles.grid}>
				{parameterElements.valueSeq()}
			</div>
		</>
	)
});

export default ParameterList;
