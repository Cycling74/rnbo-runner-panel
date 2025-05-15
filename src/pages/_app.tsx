import { AppProps } from "next/app";
import Head from "next/head";
import React, { useEffect } from "react";
import { Provider } from "react-redux";

import { Lato as lato, Ubuntu_Mono as ubuntuMono  } from "next/font/google";
const latoFont = lato({ subsets: ["latin-ext"], weight: ["300", "400", "700", "900"], style: ["normal", "italic"] });
const ubuntuMonoFont = ubuntuMono({display: "block",  subsets: ["latin-ext"], weight: ["400"] });

import "@mantine/core/styles.css";

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
			.catch((err): null => null); // handled internally

		return () => oscQueryBridge.close();
	}, []);

	return (
		<>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
			</Head>
			<style jsx global>
				{`
					html {
						font-family: ${latoFont.style.fontFamily};
					}
				`}
			</style>
			<Provider store={store}>
				<PageSettings>
					<PageTheme fontFamily={ latoFont.style.fontFamily } fontFamilyMonospace={ ubuntuMonoFont.style.fontFamily } >
						<ModalsProvider>
							<Head>
								<title>RNBO</title>
							</Head>
							<Notifications />
							<Settings />
							<EndpointInfo />
							<TransportControl />
							<AppLayout >
								<Component {...pageProps} />
							</AppLayout>
						</ModalsProvider>
					</PageTheme>
				</PageSettings>
			</Provider>
		</>
	);
}

export default App;
