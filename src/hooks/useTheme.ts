import { useMantineTheme } from "@mantine/core";
import { RNBOTheme } from "../lib/theme";
import { useAppSelector } from "./useAppDispatch";
import { RootStateType } from "../lib/store";
import { getSetting } from "../selectors/settings";
import { Setting } from "../reducers/settings";

export const useTheme = (): RNBOTheme => useMantineTheme() as RNBOTheme;

export const useThemeColorScheme = (): "light" | "dark" => {
	return useAppSelector((state: RootStateType) => getSetting<"light" | "dark">(state, Setting.colorScheme));
};
