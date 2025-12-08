from conans import ConanFile, tools

class RNBORunnerPanelConan(ConanFile):
	name = "rnborunnerpanel"
	description = "Packaged build outputs from rnbo-runner-panel"
	author = "Cycling'74"
	url = "https://github.com/Cycling74/rnbo-runner-panel"
	settings = None
	license = "MIT"
	#compiler is always rustc, this package holds an executable and not something to be linked to
	settings = { "os": ["Linux"], "arch": "armv8" }
	exports_sources = "*", "!build","!out", "!node_modules", "!server/target"

	def build(self):
		self.run("npm ci")
		self.run("npm run package-linux")

	def package(self):
		self.copy("bin/**", src="build/usr/")
		self.copy("share/**", src="build/usr/")
