import { memo, useCallback } from "react";
import ParameterItem from "./item";
import { RootStateType } from "../../lib/store";
import { getParameters } from "../../selectors/entities";
import { setRemoteParameterValueNormalized } from "../../actions/device";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import styled from "styled-components";

const ParamWrapper = styled.div`
	margin-top: 2rem;

	.parameter {
		box-sizing: border-box;
		width: 90%;
		height: 4rem;
		margin: 5px auto;
		padding: 2px;
		position: relative;
		color: ${({ theme }) => theme.colors.primary};
		z-index: 0;
		// Disables page scrolling while interacting with it
		touch-action: none;

		@media screen and (max-width: 35.5em) {
			height: 5rem;
			margin: 5px 0;
		}

		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
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
		pointer-events: none;

		@media screen and (max-width: 35.5em) {
			width: calc(100% - 5px);
			height: 0.8rem;
			margin-top: 0.2rem;
			margin-left: 0;
		}
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

		@media screen and (max-width: 35.5em) {
			width: 1.6rem;
			height: 1.6rem;
			margin-left: -0.7rem;
			border-radius: 0.8rem;
		}
	}
`;

const ParameterList = memo(function WrappedParameterList() {

	const params = useAppSelector((state: RootStateType) => getParameters(state));
	const dispatch = useAppDispatch();

	const onSetValue = useCallback((name: string, value: number) => {
		// Send Value to remote
		const ev = setRemoteParameterValueNormalized(name, value);
		ev && dispatch(ev);
	}, [dispatch] );

	return (
		<>
			<ParamWrapper>
				{
					params.valueSeq().map(p => <ParameterItem key={p.id} record={p} onSetValue={onSetValue} />)
				}
			</ParamWrapper>
		</>
	);
});

export default ParameterList;
