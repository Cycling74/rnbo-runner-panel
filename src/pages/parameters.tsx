import ParameterList from "../components/ParameterList";
import SelectDropDownMenu from "../components/selectDropdown";
import { getPresets, getParameters } from "../selectors/entities";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";


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
	const presets = useAppSelector((state: RootStateType) => getPresets(state));
	const dispatch = useAppDispatch();
	console.log("here");
	console.log(presets);
	return (
		<ParamWrapper>
			<div className="param-cols">
				<h1>Parameters</h1>
				</div>
			<div className="param-content">
				<ParameterList />
			</div>
		</ParamWrapper>
	);
}
