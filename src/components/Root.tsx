import React, { useEffect } from "react";
import Device from "../components/Device";
import { Provider } from "react-redux";
import { oscQueryBridge, parseConnectionQueryString } from "../controller/oscqueryBridgeController";
import { store } from "../lib/store";

export default function Root() {

	useEffect(() => {
		oscQueryBridge.connect(parseConnectionQueryString(location.search?.slice(1)));
		return () => oscQueryBridge.close();
	}, []);

	return (
		<Provider store={ store } >
			<Device />
		</Provider>
	)
}
