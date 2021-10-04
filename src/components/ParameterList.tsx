import { memo, useCallback } from "react";
import Parameter from "./Parameter";
import { RootStateType } from "../lib/store";
import { getParameters } from "../selectors/entities";
import { setRemoteParameterValueNormalized } from "../actions/device";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";

type ParameterListProps = {};

const ParameterList = memo(function WrappedParameterList({}: ParameterListProps) {

	const params = useAppSelector((state: RootStateType) => getParameters(state));
	const dispatch = useAppDispatch();

	const onSetValue = useCallback((name: string, value: number) => {
		// Send Value to remote
		dispatch(setRemoteParameterValueNormalized(name, value));
	}, [dispatch] );

	return (
		<>
			<div>
				{
					params.valueSeq().map(p => <Parameter key={p.id} record={p} onSetValue={onSetValue} />)
				}
			</div>
		</>
	)
});

export default ParameterList;
