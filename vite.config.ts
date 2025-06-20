import { join, normalize } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webfontDownload from "vite-plugin-webfont-dl";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
	base: "./",
	build: {
		rollupOptions: {
			output: {
				dir: normalize(join(import.meta.dirname, "dist"))
			}
		}
	},
	plugins: [
		nodePolyfills({
			include: ["events", "fs", "path", "querystring", "stream"]
		}),
		webfontDownload(),
		react()
	]
});
