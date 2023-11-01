import { FunctionComponent, PropsWithChildren, memo } from "react";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faCircleNotch, faPlugCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus } from "../../lib/constants";

import classes from "./page.module.css";

const AppStatusWrapper: FunctionComponent<PropsWithChildren> = memo(function WrappedStatusWrapper({
	children
}) {

	const status = useAppSelector((state: RootStateType) => getAppStatus(state));

	let icon: IconDefinition;
	let title: string;
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
			title = "Connection Failed";
			icon = faPlugCircleXmark;
			break;
		case AppStatus.Error:
			title = "Failed to establish Connection";
			icon = faPlugCircleXmark;
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
		</div>
	);
});

export default AppStatusWrapper;
