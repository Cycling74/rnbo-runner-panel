import { MantineProvider } from "@mantine/core";
import { rnboTheme } from "../../lib/theme";
import { FunctionComponent, PropsWithChildren } from "react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getAppSetting } from "../../selectors/settings";
import { AppSetting } from "../../models/settings";

export const PageTheme: FunctionComponent<PropsWithChildren & { fontFamily: string; } > = ({ children, fontFamily }) => {

	const colorScheme = useAppSelector((state: RootStateType) => getAppSetting(state, AppSetting.colorScheme).value as "light" | "dark");
	return (
		<MantineProvider theme={{ ...rnboTheme, fontFamily }} forceColorScheme={ colorScheme } >
			{ children }
		</MantineProvider>
	);
};
