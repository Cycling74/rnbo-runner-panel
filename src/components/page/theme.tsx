import { MantineProvider } from "@mantine/core";
import { rnboTheme } from "../../lib/theme";
import { FunctionComponent, PropsWithChildren } from "react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getAppSettingValue } from "../../selectors/settings";
import { AppSetting } from "../../models/settings";

export const PageTheme: FunctionComponent<PropsWithChildren & { fontFamily: string; } > = ({ children, fontFamily }) => {

	const colorScheme = useAppSelector((state: RootStateType) => getAppSettingValue<"light" | "dark">(state, AppSetting.colorScheme));
	return (
		<MantineProvider theme={{ ...rnboTheme, fontFamily }} forceColorScheme={ colorScheme } >
			{ children }
		</MantineProvider>
	);
};
