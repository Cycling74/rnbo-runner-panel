module.exports = {
	compiler: {
		// see https://styled-components.com/docs/tooling#babel-plugin for more info on the options.
		styledComponents: true
	},
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
	}
};
