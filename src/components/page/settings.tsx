import { FunctionComponent, PropsWithChildren, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { loadAppSettings } from "../../actions/settings";
import { RootStateType } from "../../lib/store";
import { getSettingsAreLoaded } from "../../selectors/settings";

export const PageSettings: FunctionComponent<PropsWithChildren> = ({ children }) => {
	const settingsAreLoaded = useAppSelector((state: RootStateType) => getSettingsAreLoaded(state));
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(loadAppSettings());
	}, [dispatch]);

	return settingsAreLoaded ? children : null;
};
