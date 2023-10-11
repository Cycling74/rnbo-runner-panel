const { readFileSync } = require("fs");
const { join } = require("path");

const pkgInfo = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));

module.exports = {
	reactStrictMode: true,
	webpack: (config, { isServer }) => {
		// Fixes npm packages that depend on `child_process` module
		if (!isServer) {
			config.resolve.fallback = {
				child_process: false,
				dgram: false,
				fs: false,
				net: false,
				path: false,
				stream: false
			};
		}

		return config;
	},
	env: {
		appVersion: pkgInfo.version
	}
};
