import React from "react";
import Status from "./Status";
import PresetControl from "./PresetControl";
import PatcherControl from "./PatcherControl";
import styled from "styled-components";
import { Hr } from "./Hr";
import Title from "./Title";

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
	return (
		<>
			<HeaderComponent>
				<HeaderTitle>
					<Title mobile={false} />
				</HeaderTitle>
				<HeaderControls>
					<PatcherControl />
					<PresetControl />
					<Status />
				</HeaderControls>
			</HeaderComponent>
			<Hr />
		</>
	);
};
