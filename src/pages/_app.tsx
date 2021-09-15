import { AppProps } from 'next/app'
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { oscQueryBridge, parseConnectionQueryString } from "../controller/oscqueryBridgeController";
import { store } from "../lib/store";
import Header from '../components/Header';
import Nav from '../components/Nav/nav';
import "../../styles/globals.css"
import { ThemeProvider } from "styled-components";
import { RNBOTheme } from "../lib/rnbo-theme";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'

library.add(faAngleDown);

function App({ Component, pageProps }: AppProps) {

	useEffect(() => {
		oscQueryBridge.connect(parseConnectionQueryString(location.search?.slice(1)));
		return () => oscQueryBridge.close();
	}, []);

  return (
		<Provider store={ store } >
			<ThemeProvider theme={RNBOTheme}>
				<Header />
				<Nav />
				<div className="compWrapper">
					<Component {...pageProps} />
				</div>
			</ThemeProvider>
		</Provider>
	)
}

export default App
