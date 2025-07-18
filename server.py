#!/usr/bin/env python3
import argparse
from pathlib import Path
from os import chdir, getcwd, path
from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer


def dir_path(p):

	expandedPath = path.normpath(path.join(getcwd(), p)) if not path.isabs(p) else p

	if path.isdir(expandedPath):
		return expandedPath
	else:
		raise argparse.ArgumentTypeError(f"readable_dir:{expandedPath} is not a valid path")

parser = argparse.ArgumentParser(description='Start the RNBO Runner Panel HTTP Server')
parser.add_argument('--port', type=int, default=3000,
										help='The port to listen on')
parser.add_argument('--directory', type=dir_path, required=True,
										help='The directory to serve the web content from')

args = parser.parse_args()

print(f'RNBO Runner Panel Serving from {args.directory}')
print(f'RNBO Runner Panel Serving on port {args.port}')

# Change to provided directory
chdir(args.directory)

class MyRequestHandler(SimpleHTTPRequestHandler):

	def end_headers(self):
		self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
		self.send_header("Pragma", "no-cache")
		self.send_header("Expires", "0")
		super().end_headers()


	def do_GET(self):

		fext = path.splitext(self.path)[1]
		normPath = path.normpath(self.path).split('/')
		normPath.remove('')

		fpath = path.join(args.directory, '{os.sep}'.join(normPath))
		# handle /instances/12 -> /instances/[id].html  mapping
		ipath = path.join(normPath[0], "[id].html")

		if not path.isfile(fpath) and not fext and path.isfile(fpath + '.html'):
			self.path = self.path + '.html'
		elif len(normPath) == 2 and path.isfile(path.join(args.directory, ipath)):
			self.path = path.join("/", ipath)

		return SimpleHTTPRequestHandler.do_GET(self)

Handler = MyRequestHandler

# if we restart the socket is sometimes still bound
# https://stackoverflow.com/questions/19071512/socket-error-errno-48-address-already-in-use
TCPServer.allow_reuse_address=True

server = TCPServer(('0.0.0.0', args.port), Handler)


try:
	server.serve_forever()
finally:
	server.server_close()
