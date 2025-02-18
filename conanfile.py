from conans import ConanFile, tools

class RNBORunnerPanelConan(ConanFile):
	name = "rnborunnerpanel"
	description = "Packaged build outputs from rnbo-runner-panel"
	author = "Cycling'74"
	url = "https://github.com/Cycling74/rnbo-runner-panel"
	settings = None
	no_copy_source = True

	def export_sources(self):
		self.copy("../build/usr/**")

	def package(self):
		self.copy("*")
