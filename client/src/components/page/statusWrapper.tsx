import { FunctionComponent, PropsWithChildren, ReactNode, memo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus } from "../../lib/constants";
import { Anchor } from "@mantine/core";
import { showSettings } from "../../actions/settings";

import classes from "./page.module.css";
import { IconElement } from "../elements/icon";
import { mdiLanDisconnect, mdiLoading, mdiVolumeVariantOff } from "@mdi/js";

const AppStatusWrapper: FunctionComponent<PropsWithChildren> = memo(function WrappedStatusWrapper({
	children
}) {

	const status = useAppSelector((state: RootStateType) => getAppStatus(state));
	const dispatch = useAppDispatch();

	const openSettings = useCallback(() => {
		dispatch(showSettings());
	}, [dispatch]);

	let icon: string;
	let title: string;
	let helpText: ReactNode | undefined;
	switch (status) {

		// Return nested children when all ready and good to go
		case AppStatus.Ready:
			return children;

		case AppStatus.Connecting:
			title = "Connecting";
			icon = mdiLoading;
			break;
		case AppStatus.InitializingState:
			title = "Initializing State";
			icon = mdiLoading;
			break;
		case AppStatus.Reconnecting:
			title = "Reconnecting";
			icon = mdiLoading;
			break;
		case AppStatus.ResyncingState:
			title = "Synchronizing State";
			icon = mdiLoading;
			break;
		case AppStatus.Closed:
			title = "Connection Lost";
			icon = mdiLanDisconnect;
			break;
		case AppStatus.AudioOff:
			title = "Audio is Off";
			icon = mdiVolumeVariantOff;
			helpText = (
				<>
					Go to <Anchor inherit onClick={ openSettings } >Settings</Anchor> to update audio configuration.
				</>
			);
			break;
		case AppStatus.Error:
			title = "Failed to establish Connection";
			icon = mdiLanDisconnect;
			helpText = (
				<>
					Need help or further documentation?
					<br/>
					Please refer to the
					<br/>
					<a href="https://rnbo.cycling74.com/learn/raspberry-pi-target-overview" target="_blank" rel="noreferrer noopener" >Raspberry Pi Target Documentation</a>.
				</>
			);
			break;
		default: {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const c: never = status;
		}
	}


	return (
		<div className={ classes.appStatus } data-status={ AppStatus[status].toLowerCase() } >
			<IconElement path={ icon } size={ 3 } spin={ icon === mdiLoading } />
			<h2>{ title }</h2>
			{
				helpText ? (
					<p>
						{ helpText }
					</p>
				) : null
			}
		</div>
	);
});

export default AppStatusWrapper;
