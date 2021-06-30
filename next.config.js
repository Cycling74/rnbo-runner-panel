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
			}
		}

		return config
	}
}
