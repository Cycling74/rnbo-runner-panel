import ParameterList from "../components/ParameterList";
import PresetControl from "../components/PresetControl";


import styled from "styled-components";

const ParamWrapper = styled.div`
	.param-cols {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.param-content {
		margin-top: 2rem;
	}
`;
export default function Parameters() {
	return (
		<ParamWrapper>
			<div className="param-cols">
				<h1>Parameters</h1>
				<PresetControl />
			</div>
			<div className="param-content">
				<ParameterList />
			</div>
		</ParamWrapper>
	);
}
