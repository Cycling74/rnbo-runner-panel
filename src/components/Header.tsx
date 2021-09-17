import React from "react";
import Status from "./Status";
import PresetControl from "./PresetControl";
import styled from "styled-components";

const HeaderWrapper = styled.div`
	margin: 0% 5%;
	padding: 1rem;
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
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
	}
	hr {
		border-style: none;
		border-top: 3px solid ${props => props.theme.colors.darkNeutral};
	}

`;

export default function Header({}) {
	return (
		<HeaderWrapper>
			<div className="header">
				<p> TITLE </p>
				<div id="controls">
					<PresetControl />
					<Status />
				</div>
			</div>
			<hr />
		</HeaderWrapper>
	)
}

