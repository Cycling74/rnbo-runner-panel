import Document, { Html, Head, Main, NextScript } from "next/document";
import { ColorSchemeScript } from "@mantine/core";


class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head>
					<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet" />
					<ColorSchemeScript defaultColorScheme="auto" />
					<style>{`
						body {
							overflow: hidden;
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
