import React from "react";
import Status from "./status";
import PresetControl from "./presetControl";
import PatcherControl from "./patcherControl";
import styled from "styled-components";
import { TabbedController } from "../TabbedController";
import useTitle from "../../hooks/useTitle";

const HeaderComponent = styled.header`
	padding: 1rem 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const HeaderControls = styled.div`
	display: flex;
	justify-content: flex-end;
`;

const HeaderTitle = styled.div`
	font-weight: 700;
	letter-spacing: 0.06rem;
	color: ${props => props.theme.colors.primary};
	margin: 0;
	font-size: 0.65rem;
`;

export const Header = () => {
	const title = useTitle({ mobile: false });
	return (
		<>
			<HeaderComponent>
				<HeaderTitle>
					<h1>{ title }</h1>
				</HeaderTitle>
				<HeaderControls>
					<TabbedController titles={[ "Patches", "Presets" ]}>
						<PatcherControl />
						<PresetControl />
					</TabbedController>
					<Status />
				</HeaderControls>
			</HeaderComponent>
			<hr/>
		</>
	);
};
