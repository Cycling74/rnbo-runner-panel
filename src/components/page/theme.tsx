import { MantineProvider } from "@mantine/core";
import { rnboTheme } from "../../lib/theme";
import { FunctionComponent, PropsWithChildren } from "react";
import { useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { getAppSetting } from "../../selectors/settings";
import { AppSetting } from "../../models/settings";

export type PageThemeProps = PropsWithChildren & {
	fontFamily: string;
	fontFamilyMonospace: string;
};

export const PageTheme: FunctionComponent<PageThemeProps> = ({
	children,
	fontFamily,
	fontFamilyMonospace
}) => {

	const colorScheme = useAppSelector((state: RootStateType) => getAppSetting(state, AppSetting.colorScheme).value as "light" | "dark");
	return (
		<MantineProvider theme={{ ...rnboTheme, fontFamily, fontFamilyMonospace }} forceColorScheme={ colorScheme } >
			{ children }
		</MantineProvider>
	);
};
