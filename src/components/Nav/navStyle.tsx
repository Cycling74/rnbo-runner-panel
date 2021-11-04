import styled from "styled-components";

interface NavWrapperProps {
	shown: boolean;
}
interface NavLinkProps {
	active: boolean;
}

export const NavButton = styled.button<NavWrapperProps>`
	border: none;
	background: none;
	padding: 0.2rem;
	font-size: 1.75rem;
	color: ${({ theme }) => theme.colors.lightNeutral};
	#menu {
		padding: 0.2rem;
		display: ${({ shown }) => shown ? "none" : "flex"};
	}
	#close {
		display: ${({ shown }) => shown ? "flex" : "none"};
	}
	@media screen and (max-width: 35.5em) {
		z-index: 50;
		#close {
			padding-bottom: 0.5rem;
		}
	}

`;

export const NavLink = styled.a<NavLinkProps>`
	padding: 0.5rem 0.1rem;
	color: ${({ active, theme}) => active ? theme.colors.secondary : theme.colors.lightText };
	&:hover {
		color: ${props => props.theme.colors.hilight};
		text-decoration: underline;
	}
`;

export const NavOpen = styled.div<NavWrapperProps>`
	display: ${({ shown }) => shown ? "flex" : "none"};
	flex-direction: column;
	color: ${({ theme }) => theme.colors.lightNeutral};
	font-weight: 700;
	letter-spacing: 0.06rem;
	margin-right: 0.5rem;
	@media screen and (max-width: 35.5em) {
		padding: 0.5rem;
	}
`;

export const NavigationWrapper = styled.div<NavWrapperProps>`
	width: ${({ shown }) => shown ? "10rem" : "3rem"};
	transition: width 0.5s;
	height: 100%;
	margin: 0;
	background-color: ${({ theme }) => theme.colors.primary};
	display: flex;
	justify-content: center;
	position: fixed;
	z-index: 100;
`;

export const MobileNavWrapper = styled.div<NavWrapperProps>`
	display: none;
	@media screen and (max-width: 35.5em) {
    	display: flex;
	  	justify-content: flex-start;
	  	height: ${({ shown }) => shown ? "10rem" : "3.5rem"};
	  	transition: height 0.4s;
	 	width: 100%;
		margin: 0;
		background-color: ${({ theme }) => theme.colors.primary};
		position: relative;
		z-index: 300;
		.mobile-header {
			color: white;
			width: 100%;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			position: fixed;
			.header-group {
				display: flex;
				flex-direction: row;
				justify-content: flex-end;
				padding: 0.5rem 0.5rem 0rem 0rem;
			}
		}
    }
`;


