import React from 'react';
import Device from '../components/Device'
import { DeviceProvider } from "../contexts/device";
import { Provider } from "react-redux";
import { createStore } from 'redux';
import { rootReducer } from '../reducers';
import { initState } from '../lib/store';
import { setConnectionStatus } from '../actions/network';
import { OSCQueryBridgeController } from '../controller/oscqueryBridgeController';
import { store } from "../lib/store";

const oscqueryBridgeController = new OSCQueryBridgeController();
const handleStatus = (err?: Error) => {
	store.dispatch(setConnectionStatus(oscqueryBridgeController.readyState));
}
oscqueryBridgeController.on("open", handleStatus);
oscqueryBridgeController.on("close", handleStatus);
oscqueryBridgeController.on("error", handleStatus);

export default function Root() {
	return (
		<Provider store={store}>
			<DeviceProvider bridge={oscqueryBridgeController}>
				<Device />
			</DeviceProvider>
		</Provider>
	)
}
