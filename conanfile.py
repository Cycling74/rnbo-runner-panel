from conans import ConanFile, tools

class RNBORunnerPanelConan(ConanFile):
	name = "rnborunnerpanel"
	description = "Packaged build outputs from rnbo-runner-panel"
	author = "Cycling'74"
	url = "https://github.com/Cycling74/rnbo-runner-panel"
	settings = None
	license = "MIT"
	#compiler is always rustc, this package holds and executable and not something to be linked to
	settings = "os", "arch", "build_type"
	no_copy_source = True

	def export_sources(self):
		self.copy("bin/**", src="build/usr/")
		self.copy("share/**", src="build/usr/")

	def build(self):
		#do nothing
		return

	def package(self):
		self.copy("*")
