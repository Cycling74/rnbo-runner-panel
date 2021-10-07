import ParameterList from "../components/ParameterList";
import styled from "styled-components";

const ParamWrapper = styled.div`
	.param-content {
		margin-top: 2rem;
	}

	.parameter {
	width: 100%;
	height: 4rem;
	margin: 5px;
	padding: 2px;
	position: relative;
	color: #082036;
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
		background-color: #21496D;
	}

	.sliderKnob {
		width: 1.2rem;
		height: 1.2rem;
		margin-left: -0.5rem;
		top: -0.4rem;
		border-radius: 0.6rem;
		background-color: #21496D;
		position: absolute;
	}
`;
export default function Parameters() {
	return (
		<ParamWrapper>
			<div className="param-content">
				<ParameterList />
			</div>
		</ParamWrapper>
	);
}
