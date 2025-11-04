from conans import ConanFile, tools

class RNBORunnerPanelConan(ConanFile):
	name = "rnborunnerpanel"
	description = "Packaged build outputs from rnbo-runner-panel"
	author = "Cycling'74"
	url = "https://github.com/Cycling74/rnbo-runner-panel"
	settings = None
	license = "MIT"
	#compiler is always rustc, this package holds and executable and not something to be linked to
	#settings = "os", "arch", "build_type"
	settings = { "os": ["Linux"], "arch": "armv8" }
	exports_sources = "*", "!build","!out", "!node_modules", "!server/target"

#	def source(self):
#		git = tools.Git()
#		git.clone("git@github.com:Cycling74/rnbo-runner-panel.git", "feature/rustserver")
#		#git.run("checkout v%s" % self.version)
#		git.run("submodule update --init --recursive")

	def build(self):
		self.run("npm ci")
		self.run("npm run package-linux")

	def package(self):
		self.copy("bin/**", src="build/usr/")
		self.copy("share/**", src="build/usr/")
