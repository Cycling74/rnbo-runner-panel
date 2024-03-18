import { FunctionComponent, memo } from "react";
import ParameterItem, { parameterBoxHeight } from "./item";
import classes from "./parameters.module.css";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import { Breakpoints } from "../../lib/constants";
import { clamp } from "../../lib/util";
import { ParameterRecord } from "../../models/parameter";
import { InstanceStateRecord } from "../../models/instance";

export type ParameterListProps = {
	onSetNormalizedValue: (parameter: ParameterRecord, nValue: number) => any;
	parameters: InstanceStateRecord["parameters"];
}

const ParameterList: FunctionComponent<ParameterListProps> = memo(function WrappedParameterList({
	onSetNormalizedValue,
	parameters
}) {
	const { ref, height: elHeight } = useElementSize();
	const { width } = useViewportSize();

	const paramOverflow = elHeight === 0 || isNaN(elHeight) ? 1 : Math.ceil((parameters.size * parameterBoxHeight) / elHeight);

	let columnCount = 1;
	if (width >= Breakpoints.xl) {
		columnCount = clamp(paramOverflow, 1, 4);
	} else if (width >= Breakpoints.lg) {
		columnCount = clamp(paramOverflow, 1, 3);
	} else if (width >= Breakpoints.sm) { // treat SM and MD equal
		columnCount = clamp(paramOverflow, 1, 2);
	}

	return (
		<div ref={ ref } className={ classes.parameterList } style={{ columnCount }} >
			{
				ref.current === null ? null : parameters.valueSeq().map(p => <ParameterItem key={p.id} param={p} onSetNormalizedValue={onSetNormalizedValue} />)
			}
		</div>
	);
});

export default ParameterList;
