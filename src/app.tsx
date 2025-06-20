import { Provider } from "react-redux";
import { useEffect } from "react";
import { RouterProvider } from "react-router";

import { oscQueryBridge, parseConnectionQueryString } from "./controller/oscqueryBridgeController";
import { store } from "./lib/store";
import { router } from "./routes";

import { ColorSchemeScript } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

import { PageSettings } from "./components/page/settings";
import { PageTheme } from "./components/page/theme";
import Notifications from "./components/notifications";
import Settings from "./components/settings";
import EndpointInfo from "./components/page/endpoint";
import TransportControl from "./components/page/transport";

export const App = () => {

	useEffect(() => {
		oscQueryBridge.connect(parseConnectionQueryString(location.search?.slice(1)))
			.catch((err): null => null); // handled internally

		return () => oscQueryBridge.close();
	}, []);

	return (
		<>
			<ColorSchemeScript defaultColorScheme="auto" />
			<Provider store={store} >
				<PageSettings>
					<PageTheme >
						<ModalsProvider>
							<Notifications />
							<Settings />
							<EndpointInfo />
							<TransportControl />
							<RouterProvider router={router} />
						</ModalsProvider >
					</PageTheme >
				</PageSettings >
			</Provider >
		</>
	);
};
