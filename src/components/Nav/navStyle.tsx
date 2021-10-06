import styled from "styled-components";

interface StyledProps {
	shown: boolean;
}
const NavigationWrapper = styled.div.attrs((props: StyledProps) => ({
	style: {
		width: props.shown ? 150 : 40
	}
}))`
	height: 100%;
	margin: 0;
	transition: width .4s;
	background-color: ${props => props.theme.colors.primary};
	display: flex;
	justify-content: center;
	position: fixed;
	z-index: 100;

	.navOpenWrapper {
		display: flex;
		flex-direction: column;
		color: #F6F6F6;
		font-weight: 700;
		letter-spacing: 0.06rem;
		margin-left: 0.5rem;
		a {
			padding: 0.5rem 0.1rem;
		}
		a:hover {
			color: ${props => props.theme.colors.hilight};
			text-decoration: underline;
		}
		.active {
			color: ${props => props.theme.colors.secondary};
		}
	}
	#burger {
		font-size: 1.75rem;
		color: #F6F6F6;
	}

	#close {
		font-size: 2em;
		display: flex;
		color: #F6F6F6;
	}

	.button {
		border: none;
		background: none;
		padding: 0;
	}

	.showNav {
		display: flex;
	}

	.hideNav {
		display: none;
	}
	.navClose {
		width: 10%;
	}
`;

export default NavigationWrapper;
