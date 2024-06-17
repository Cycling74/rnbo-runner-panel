import { FunctionComponent, PropsWithChildren, ReactNode, memo, useCallback } from "react";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faCircleNotch, faPlugCircleXmark, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppSelector, useAppDispatch } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus } from "../../lib/constants";
import { Anchor } from "@mantine/core";
import { showSettings } from "../../actions/settings";

import classes from "./page.module.css";

const AppStatusWrapper: FunctionComponent<PropsWithChildren> = memo(function WrappedStatusWrapper({
	children
}) {

	const status = useAppSelector((state: RootStateType) => getAppStatus(state));
	const dispatch = useAppDispatch();

	const openSettings = useCallback(() => {
		dispatch(showSettings());
	}, [dispatch]);

	let icon: IconDefinition;
	let title: string;
	let helpText: ReactNode | undefined;
	switch (status) {

		// Return nested children when all ready and good to go
		case AppStatus.Ready:
			return children;

		case AppStatus.Connecting:
			title = "Connecting";
			icon = faCircleNotch;
			break;
		case AppStatus.InitializingState:
			title = "Initializing State";
			icon = faCircleNotch;
			break;
		case AppStatus.Reconnecting:
			title = "Reconnecting";
			icon = faCircleNotch;
			break;
		case AppStatus.ResyncingState:
			title = "Synchronizing State";
			icon = faCircleNotch;
			break;
		case AppStatus.Closed:
			title = "Connection Lost";
			icon = faPlugCircleXmark;
			break;
		case AppStatus.AudioOff:
			title = "Audio is Off";
			icon = faVolumeXmark;
			helpText = (
				<>
					Go to <Anchor inherit onClick={ openSettings } >Settings</Anchor> to update audio configuration.
				</>
			);
			break;
		case AppStatus.Error:
			title = "Failed to establish Connection";
			icon = faPlugCircleXmark;
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
			<FontAwesomeIcon icon={ icon } size="3x" spin={ icon === faCircleNotch } />
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
