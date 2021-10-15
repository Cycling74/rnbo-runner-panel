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
parser.add_argument('--port', type=int, default=3000, nargs=1,
										help='The port to listen on')
parser.add_argument('--directory', type=dir_path, required=True, nargs=1,
										help='The directory to serve the web content from')

args = parser.parse_args()

port = args.port
directory = args.directory[0]

print(f'RNBO Runner Panel Serving from {directory}')
print(f'RNBO Runner Panel Serving on port {port}')

# Change to provided directory
chdir(directory)

class MyRequestHandler(SimpleHTTPRequestHandler):
	def do_GET(self):

		fext = path.splitext(self.path)[1]
		normPath = path.normpath(self.path).split('/')
		normPath.remove('')
		fpath = path.join(directory, '{os.sep}'.join(normPath))

		if not path.isfile(fpath) and not fext and path.isfile(fpath + '.html'):
			self.path = self.path + '.html'

		return SimpleHTTPRequestHandler.do_GET(self)

Handler = MyRequestHandler
server = TCPServer(('0.0.0.0', args.port), Handler)

server.serve_forever()
