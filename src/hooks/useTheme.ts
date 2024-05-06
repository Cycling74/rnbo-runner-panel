import { useMantineTheme } from "@mantine/core";
import { RNBOTheme } from "../lib/theme";
import { useAppSelector } from "./useAppDispatch";
import { RootStateType } from "../lib/store";
import { getAppSettingValue } from "../selectors/settings";
import { AppSetting } from "../models/settings";

export const useTheme = (): RNBOTheme => useMantineTheme() as RNBOTheme;

export const useThemeColorScheme = (): "light" | "dark" => {
	return useAppSelector((state: RootStateType) => getAppSettingValue<"light" | "dark">(state, AppSetting.colorScheme));
};
