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
import MobileNav from "../components/Nav/mobileNav";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleDown, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
library.add(faAngleDown, faBars, faTimes);

// https://github.com/vercel/next.js/issues/20682
//required when using next/head
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
}

a {
	color: inherit;
	text-decoration: none;
}
`;

const ContentWrapper = styled.div`
	margin: 0% 7%;
	@media screen and (max-width: 35.5em) {
		padding-top: 5rem;
	}
`;

const Desktop = styled.div`
	@media screen and (max-width: 35.5em) {
		display: none;
	}
`;

function App({ Component, pageProps }: AppProps) {

	useEffect(() => {
		oscQueryBridge.connect(parseConnectionQueryString(location.search?.slice(1)));
		return () => oscQueryBridge.close();
	}, []);

	return (
		<Provider store={store}>
			<Head>
				<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet" />
			</Head>
			<ThemeProvider theme={RNBOTheme}>
				<GlobalWrapper />
				<Desktop>
					<Nav />
					<Header />
				</Desktop>
				<MobileNav />
				<ContentWrapper>
					<Component {...pageProps} />
				</ContentWrapper>
			</ThemeProvider>
		</Provider>
	);
}

export default App;
