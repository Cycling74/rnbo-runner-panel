import { memo, useCallback } from "react";
import ParameterItem, { parameterBoxHeight } from "./item";
import { RootStateType } from "../../lib/store";
import { getParameters } from "../../selectors/entities";
import { setRemoteParameterValueNormalized } from "../../actions/device";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import classes from "./parameters.module.css";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import { Breakpoints } from "../../lib/constants";
import { clamp } from "../../lib/util";

const ParameterList = memo(function WrappedParameterList() {

	const params = useAppSelector((state: RootStateType) => getParameters(state));
	const dispatch = useAppDispatch();
	const { ref, height: elHeight } = useElementSize();
	const { width } = useViewportSize();

	const onSetValue = useCallback((name: string, value: number) => {
		// Send Value to remote
		const ev = setRemoteParameterValueNormalized(name, value);
		ev && dispatch(ev);
	}, [dispatch] );

	const paramOverflow = elHeight === 0 || isNaN(elHeight) ? 1 : Math.ceil((params.size * parameterBoxHeight) / elHeight);
	let columnCount = 1;
	if (width >= Breakpoints.md) {
		columnCount = clamp(paramOverflow, 1, 2);
	} else if (width >= Breakpoints.lg) {
		columnCount = clamp(paramOverflow, 1, 3);
	} else if (width >= Breakpoints.xl) {
		columnCount = clamp(paramOverflow, 1, 4);
	}

	return (
		<div ref={ ref } className={ classes.parameterList } style={{ columnCount }} >
			{
				params.valueSeq().map(p => <ParameterItem key={p.id} record={p} onSetValue={onSetValue} />)
			}
		</div>
	);
});

export default ParameterList;
