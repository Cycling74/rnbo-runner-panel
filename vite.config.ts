import { join, normalize } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webfontDownload from "vite-plugin-webfont-dl";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { readFileSync } from "fs";

const licenseText = readFileSync(join(import.meta.dirname, "LICENSE.txt"), "utf-8");
const pInfo = JSON.parse(readFileSync(join(import.meta.dirname, "package.json"), "utf-8"));

const banner = `
/**
* @license ${pInfo.name}
* v${pInfo.version}
*
* ${licenseText.split("\n").join("\n* ")}
*/
`.trim();

// https://vitejs.dev/config/
export default defineConfig({
	base: "./",
	build: {
		rollupOptions: {
			output: {
				banner,
				dir: normalize(join(import.meta.dirname, "out"))
			}
		}
	},
	plugins: [
		nodePolyfills({
			include: ["events", "fs", "path", "querystring", "stream"]
		}),
		webfontDownload(
			[],
			{
				subsetsAllowed: ["latin"]
			}
		),
		react()
	]
});
