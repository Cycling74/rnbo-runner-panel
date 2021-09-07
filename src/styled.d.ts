import 'styled-components';

declare module 'styled-components' {
  export interface RNBOTheme {
    colors: {
		darkText: string,
		lightText: string,
		primary: string,
		secondary: string,
		hilight: string,
		darkNeutral: string,
		lightNeutral: string,
		alert: string
    };
  }
}
