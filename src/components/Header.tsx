import React from "react";
import Status from "./Status";
import styled from "styled-components";

const HeaderWrapper = styled.div`
background-color: #21496D;
display: flex;
justify-content: space-between;
align-items: center;
padding: 1% 2%;
color: white;
z-index: 100;

h2 {
	margin: 0;
}

`;

export default function Header({}) {
	return (
		<HeaderWrapper>
			<h2> RNBO Runner Panel</h2>
			<Status />
		</HeaderWrapper>
	)
}

