import React, { FunctionComponent } from "react";
import styled from "styled-components";

const HrComponent = styled.hr`
	margin: 0%;
	padding: 1rem;
	border-style: none;
	border-top: 3px solid ${props => props.theme.colors.darkNeutral};
`;

export const Hr: FunctionComponent<Record<string, never>> = () => <HrComponent />;

