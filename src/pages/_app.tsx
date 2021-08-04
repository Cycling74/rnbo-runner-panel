import { AppProps } from 'next/app'
import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { oscQueryBridge, parseConnectionQueryString } from "../controller/oscqueryBridgeController";
import Link from "next/link";
import { store } from "../lib/store";

import "../../styles/globals.css"

function App({ Component, pageProps }: AppProps) {

	useEffect(() => {
		oscQueryBridge.connect(parseConnectionQueryString(location.search?.slice(1)));
		return () => oscQueryBridge.close();
	}, []);

  return (
		<Provider store={ store } >
			<Link href="/">Root</Link>
			<Link href="/io">IO</Link>
			<Link href="/parameters">Parameters</Link>
			<Component {...pageProps} />
		</Provider>
	)
}

export default App
