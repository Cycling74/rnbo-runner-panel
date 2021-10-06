import React from "react";
import styled from "styled-components";

const HrComponent = styled.hr`
	border-style: none;
	border-top: 3px solid ${props => props.theme.colors.darkNeutral};
`;

const Hr = () => {
	return (
		<HrComponent />
	);
};

module.exports = {
	Hr
};
