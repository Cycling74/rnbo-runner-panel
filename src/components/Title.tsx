import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
const TitleWrapper = styled.div`

`;
export default function Title() {
	const router = useRouter();
	const currentPath = router.pathname;
	return (
		<TitleWrapper>
			<h4> {currentPath} </h4>
		</TitleWrapper>
	);
}
