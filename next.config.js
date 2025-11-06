const { readFileSync } = require("fs");
const { join } = require("path");

const pkgInfo = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));

module.exports = {
	output: "export",
	reactStrictMode: false,
	env: {
		appVersion: pkgInfo.version
	}
};
