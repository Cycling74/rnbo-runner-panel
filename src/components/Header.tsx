import React from "react";
import Status from "./Status";
import PresetControl from "./PresetControl";
import styled from "styled-components";
import { Hr } from "./Hr";
import Title from "./Title";

const HeaderComponent = styled.header`
	margin: 0% 5%;
	padding: 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const HeaderControls = styled.div`
	width: 50%;
	display: flex;
	justify-content: flex-end;
`;

const HeaderTitle = styled.div`
	align-self: flex-end;
	font-weight: 700;
	letter-spacing: 0.06rem;
	color: ${props => props.theme.colors.primary};
	margin: 0;
	font-size: 0.65rem;
`;
export const Header = () => {
	return (
		<div>
			<HeaderComponent>
				<HeaderTitle>
					<Title mobile={false} />
				</HeaderTitle>
				<HeaderControls>
					<PresetControl />
					<Status />
				</HeaderControls>
			</HeaderComponent>
			<Hr />
		</div>
	);
};
