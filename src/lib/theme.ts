import { Button, Drawer, MantineTheme, MantineThemeOther, Modal, Tabs, TextInput, Tooltip, createTheme, rem } from "@mantine/core";

export type CustomThemeProps = {
	headerHeight: number | string;
	navWidth: number | string;
};

export const customProps: MantineThemeOther & CustomThemeProps = {
	headerHeight: rem(50),
	navWidth: rem(60)
};

export const rnboTheme = createTheme({
	cursorType: "pointer",
	headings: {
		sizes: {
			h1: {
				fontWeight: "900"
			},
			h2: {
				fontWeight: "700"
			},
			h3: {
				fontWeight: "700"
			},
			h4: {
				fontWeight: "700"
			},
			h5: {
				fontWeight: "700"
			},
			h6: {
				fontWeight: "700"
			}
		}
	},
	components: {
		Button: Button.extend({
			styles: {
				label: { fontWeight: "700" }
			}
		}),
		Drawer: Drawer.extend({
			styles: {
				title: { fontWeight: "700" }
			}
		}),
		Modal: Modal.extend({
			styles: {
				title: { fontWeight: "700" }
			}
		}),
		Tabs: Tabs.extend({
			styles: {
				tabLabel: { fontWeight: "700" }
			}
		}),
		TextInput: TextInput.extend({
			styles: {
				label: { fontWeight: "700" }
			}
		}),
		Tooltip: Tooltip.extend({
			defaultProps: {
				openDelay: 500
			}
		})
	},
	other: customProps
});

export type RNBOTheme = MantineTheme & { other: typeof customProps };
