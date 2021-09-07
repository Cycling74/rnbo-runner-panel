import styled from "styled-components";

const NavigationWrapper = styled.div.attrs(({shown}) => ({

	style: {
		width: shown? 150 : 40
	}

}))`
	height: 100%;
	overflow: auto;
	margin: 0;
	overflow: hidden;
	transition: width .3s;
	background-color: #21496D;
	display: flex;
	justify-content: center;
	position: absolute;
	z-index: 100;

	.navOpenWrapper {
		display: flex;
		flex-direction: column;
		color: #F6F6F6;
	}
	/* .navClosedWrapper {
		width:
	} */

	#burger {
		font-size: 2em;
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
