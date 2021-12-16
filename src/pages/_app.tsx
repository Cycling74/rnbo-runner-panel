import { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { oscQueryBridge, parseConnectionQueryString } from "../controller/oscqueryBridgeController";
import { store } from "../lib/store";
import Nav from "../components/Nav/nav";
import { Header } from "../components/Header";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { RNBOTheme } from "../lib/rnbo-theme";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleDown, faAngleUp, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
library.add(faAngleDown, faAngleUp, faBars, faTimes);

// https://github.com/vercel/next.js/issues/20682
// required when using next/head
import "@fortawesome/fontawesome-svg-core/styles.css";

const GlobalWrapper = createGlobalStyle`
html,
body,
body > div:first-child,
div#__next {
	height: 100%;
	padding: 0;
	margin: 0;
	font-family: Lato, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
		Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
	overscroll-behavior-x: none;
}

* {
	-webkit-font-smoothing: antialiased;
}

a {
	color: inherit;
	text-decoration: none;
}
`;

const ContentWrapper = styled.div`
	box-sizing: border-box;
	padding: 0 64px 0 96px;
	width: 100%;

	@media (max-width: 769px) {
		padding: 0 16px;
	}
`;

const Container = styled.div`
	display: flex;

	@media (max-width: 769px) {
		flex-direction: column;
	}
`;

function App({ Component, pageProps }: AppProps) {

	useEffect(() => {
		oscQueryBridge.connect(parseConnectionQueryString(location.search?.slice(1)))
			.catch(err => null); // handled internally

		return () => oscQueryBridge.close();
	}, []);

	return (
		<Provider store={store}>
			<ThemeProvider theme={RNBOTheme}>
				<Head>
					<title>RNBO</title>
				</Head>
				<GlobalWrapper />
				<Container>
					<Nav />
					<ContentWrapper>
						<Header />
						<Component {...pageProps} />
					</ContentWrapper>
				</Container>
			</ThemeProvider>
		</Provider>
	);
}

export default App;
