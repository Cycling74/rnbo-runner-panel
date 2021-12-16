import styled from "styled-components";

interface NavProps {
	darkOnMobile?: boolean;
}

export const NavSidebar = styled.div`
	position: fixed;
	height: 100%;
	padding: 8px 16px 0;
	background: ${({ theme }) => theme.colors.primary};
	box-sizing: border-box;

	@media (max-width: 769px) {
		position: static;
		height: auto;
		width: 100%;
		background: none;
	}
`;

export const NavControl = styled.div<NavProps>`
	display: inline-block;
	font-size: 1.75rem;
	color: ${({ theme }) => theme.colors.lightNeutral};
	cursor: pointer;
	margin-bottom: 16px;

	@media (max-width: 769px) {
		margin-bottom: 8px;
		color: ${({ darkOnMobile, theme }) => darkOnMobile ? theme.colors.primary : theme.colors.lightNeutral};
	}
`;

export const NavContainer = styled.div<NavProps>`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;

	position: fixed;
	left: ${({ visible }) => visible ? "0" : "-100%"};
	transition: left 0.3s;

	height: 100%;
	padding: 8px 64px 0 16px;
	background: ${({ theme }) => theme.colors.primary};
	z-index: 10;

	font-weight: 500;
	letter-spacing: 1px;

	@media (max-width: 769px) {
		margin-bottom: 8px;
	}
`;
