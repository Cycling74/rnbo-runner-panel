import { memo, useCallback } from "react";
import Parameter from "./Parameter";
import { RootStateType } from "../lib/store";
import { getParameters } from "../selectors/entities";
import { setRemoteParameterValueNormalized } from "../actions/device";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import styled from "styled-components";

const ParamWrapper = styled.div`
	margin-top: 2rem;

	.parameter {
		width: 100%;
		height: 4rem;
		margin: 5px;
		padding: 2px;
		position: relative;
		color: ${({ theme }) => theme.colors.primary};
		z-index: 0;
	}

	.parameterLabel {
		display: flex;
		justify-content: space-between;
		user-select: none;
	}

	.slider {
		width: 90%;
		margin-left: 5%;
		height: 0.5rem;
		border-radius: 0.4rem;
		background-color:lightgray;
		position: absolute;
		top: 50%;
	}

	.activeRange {
		height: 100%;
		border-radius: 0.4rem;
		background-color: ${({ theme }) => theme.colors.primary};
	}

	.sliderKnob {
		width: 1.2rem;
		height: 1.2rem;
		margin-left: -0.5rem;
		top: -0.4rem;
		border-radius: 0.6rem;
		background-color: ${({ theme }) => theme.colors.primary};
		position: absolute;
		touch-action: pan-x;
	}
`;

const ParameterList = memo(function WrappedParameterList() {

	const params = useAppSelector((state: RootStateType) => getParameters(state));
	const dispatch = useAppDispatch();

	const onSetValue = useCallback((name: string, value: number) => {
		// Send Value to remote
		dispatch(setRemoteParameterValueNormalized(name, value));
	}, [dispatch] );

	return (
		<>
			<ParamWrapper>
				{
					params.valueSeq().map(p => <Parameter key={p.id} record={p} onSetValue={onSetValue} />)
				}
			</ParamWrapper>
		</>
	);
});

export default ParameterList;
