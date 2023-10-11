import { MantineProvider } from "@mantine/core";
import { rnboTheme } from "../../lib/theme";
import { FunctionComponent, PropsWithChildren } from "react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getSetting } from "../../selectors/settings";
import { Setting } from "../../reducers/settings";

export const PageTheme: FunctionComponent<PropsWithChildren> = ({ children }) => {

	const colorScheme = useAppSelector((state: RootStateType) => getSetting<"light" | "dark">(state, Setting.colorScheme));
	return (
		<MantineProvider theme={ rnboTheme } forceColorScheme={ colorScheme } >
			{ children }
		</MantineProvider>
	);
};
