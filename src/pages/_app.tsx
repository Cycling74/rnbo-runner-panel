import { AppProps } from 'next/app'
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { oscQueryBridge, parseConnectionQueryString } from "../controller/oscqueryBridgeController";
import { store } from "../lib/store";
import Nav from '../components/Nav/nav';
import { Header } from '../components/Header';
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { RNBOTheme } from "../lib/rnbo-theme";
import Status from "../components/Status";
import PresetControl from '../components/PresetControl';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
library.add(faAngleDown);

const GlobalWrapper = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap');

html,
body,
body > div:first-child,
div#__next {
  height: 100%;
  padding: 0;
  margin: 0;
  font-family: Lato, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

.compWrapper {
	margin: 0% 7%;
}

a {
  color: inherit;
  text-decoration: none;
}

.smallButton {
	color: ${props => props.theme.colors.darkText};
	background-color: ${props => props.theme.colors.secondary};
	border-radius: 3px;
	border-style: none;
	margin-left: .4rem;
	padding: 0.15rem;
	text-align: center;
	cursor: pointer;
	&:hover{
		background-color: ${props => props.theme.colors.hilight};
	}
}
`;

function App({ Component, pageProps }: AppProps) {

	useEffect(() => {
		oscQueryBridge.connect(parseConnectionQueryString(location.search?.slice(1)));
		return () => oscQueryBridge.close();
	}, []);

  return (
		<Provider store={ store } >
			<ThemeProvider theme={RNBOTheme}>
				<GlobalWrapper />
					<Nav />
				<div className="headerPanel">
					<Header />
				</div>
				<div className="compWrapper">
					<Component {...pageProps} />
				</div>
			</ThemeProvider>
		</Provider>
	)
}

export default App
