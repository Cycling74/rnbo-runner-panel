import Document, { Html, Head, Main, NextScript } from "next/document";
import { ColorSchemeScript } from "@mantine/core";


class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<ColorSchemeScript defaultColorScheme="auto" />
					<style>{`
						body {
							overflow: hidden;
							touch-action: pan-x pan-y;
						}
					`}</style>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
