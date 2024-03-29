import { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect } from "react";
import { Provider } from "react-redux";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faAngleDown, faAngleUp, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
library.add(faAngleDown, faAngleUp, faBars, faTimes);

import "@mantine/core/styles.css";

// https://github.com/vercel/next.js/issues/20682
// required when using next/head
import "@fortawesome/fontawesome-svg-core/styles.css";

import { oscQueryBridge, parseConnectionQueryString } from "../controller/oscqueryBridgeController";
import { store } from "../lib/store";

import { AppLayout } from "../layouts/app";
import { PageSettings } from "../components/page/settings";
import { PageTheme } from "../components/page/theme";
import Notifications from "../components/notifications";
import Settings from "../components/settings";
import EndpointInfo from "../components/page/endpoint";
import { ModalsProvider } from "@mantine/modals";
import TransportControl from "../components/page/transport";

function App({ Component, pageProps }: AppProps) {

	useEffect(() => {
		oscQueryBridge.connect(parseConnectionQueryString(location.search?.slice(1)))
			.catch(err => null); // handled internally

		return () => oscQueryBridge.close();
	}, []);

	return (
		<Provider store={store}>
			<PageSettings>
				<PageTheme>
					<ModalsProvider>
						<Head>
							<title>RNBO</title>
						</Head>
						<Notifications />
						<Settings />
						<EndpointInfo />
						<TransportControl />
						<AppLayout>
							<Component {...pageProps} />
						</AppLayout>
					</ModalsProvider>
				</PageTheme>
			</PageSettings>
		</Provider>
	);
}

export default App;
