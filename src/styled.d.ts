import "styled-components";
declare module "styled-components" {
	export interface DefaultTheme {
		colors: {
			darkText: string;
			lightText: string;
			primary: string;
			secondary: string;
			hilight: string;
			darkNeutral: string;
			lightNeutral: string;
			alert: string;
			success: string;
		};
	}
}
