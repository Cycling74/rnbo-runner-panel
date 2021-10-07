import React from "react";
import Status from "./Status";
import PresetControl from "./PresetControl";
import styled from "styled-components";
import { Hr } from "./Hr";

const HeaderWrapper = styled.div`
	margin: 0% 5%;
	padding: 1rem;

	#controls {
		width: 50%;
		display: flex;
		justify-content: flex-end;
	}

	p {
		align-self: flex-end;
		font-weight: 700;
		letter-spacing: 0.06rem;
		color: ${props => props.theme.colors.primary};
		margin: 0;
	}
`;

const HeaderComponent = styled.header`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Header = () => {
	return (
		<HeaderWrapper>
			<HeaderComponent>
				<p> TITLE </p>
				<div id="controls">
					<PresetControl />
					<Status />
				</div>
			</HeaderComponent>
			<Hr />
		</HeaderWrapper>
	);
};
