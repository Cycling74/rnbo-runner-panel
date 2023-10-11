import { MantineTheme, MantineThemeOther, createTheme, rem } from "@mantine/core";

export type CustomThemeProps = {
	headerHeight: number | string;
	navWidth: number | string;
};

export const customProps: MantineThemeOther & CustomThemeProps = {
	headerHeight: rem(50),
	navWidth: rem(60)
};

export const rnboTheme = createTheme({
	other: customProps
});

export type RNBOTheme = MantineTheme & { other: typeof customProps };
