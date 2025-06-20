# RNBO Runner Web Interface

This is a web app that lets you control the graph and patches exported to a RNBO Runner. You can use this interface to manage, change and interact with the running graph as well as exported RNBO patches on the device. It will let you set build audio graphs, change parameters, send MIDI events, send messages to inports and receive them from outports and more.

## Usage with RNBO

The primary purpose of this app is to provide a visual interface to interact with a running RNBO runner, eg on a Raspberry Pi. It provides a simple interface to most of the endpoints exposed by the RNBO Runner. The interface should automatically include any parameters, inports, and outports in your RNBO patch. Note that this interface is not really intended to be used as a performance tool and while it's possible, it is not optimized for live interaction.

The RNBO image for the Raspberry Pi includes this application, and runs an HTTP server that serves the page on port 3000. So if your `pi` had the hostname `c74rpi` and the IP address `192.168.88.111`, then from any device on your local network you could visit `http://c74rpi:3000` or `http://192.168.88.1111:3000` to see this page.

## How it Works

The RNBO Runner implements [OSCQuery](https://github.com/Vidvox/OSCQueryProposal), and responds to HTTP requests and WebSocket connections on port 5678. The Runner Web Interface opens a WebSocket connection to the RNBO Runner on port 5678 (the default port) and sends OSC messages to it. Using OSCQuery over this connection, the application displays the currently loaded graph, devices, their parameters and more. Using the OSCQuery API as a basis the application allows to interact with the RNBO runner by sending and receiving OSC messages via its WebSocket connection.

## Getting Started (Development)

First, run the development server:

```bash
npm ci
npm run dev
```

Open the display URL in your browser to access the development server of the project.

## Hostname and Port

By default, the app is exposed on port 3000 and tries to connect to port 5678 at the same address as the page itself. So if you load the site at "http://localhost:3000", the page will attempt to form a websocket connection to port 5678 on localhost. You can override this default behavior with the query parameters `h` and `p` for hostname and port, respectively. Connecting to "http://localhost:3000?h=c74rpi.local" will make the page try to make a websocket connection to port 5678 and hostname c74rpi.local. The endpoint is also shown in the endpoint info modal (available via the header in the application) and you can set a different hostname and port to connect to a runner that's not running on the same device / hostname as the Runner Web interface.

## Export

You can export the whole site as a static page by running `npm run build`. This will create an "out" directory containing the entire static site. To run this site on a Raspberry Pi (for example), you simple need to start a static web server on the Pi that serves this directory. An easy way to do this is to start an nginx server on the Pi, and to copy the contents of "out" to /var/www/html.

## Building deb

**Requirements**

* `dpkg-deb`
  * `apt-get install dpkg` (likely already installed)
  * `brew install dpkg`

```shell
npm run package-debian
```

You should then see a `.deb` file in your working directory.

## Installing or upgrading on a Raspberry PI

If you haven't already setup the rnbooscquery runner, [follow the instructions](https://app.assembla.com/spaces/max/git-7/source/master/examples/RNBOOSCQueryRunner/README-rpi.md)
to do that.

Then, assuming you're sshed into your pi, update your apt lists and install/upgrade:

```shell
sudo apt-get update
sudo apt-get install rnbo-runner-panel
```

## Connecting to the panel running on a Raspberry PI

Once you've installed, you should then be able to load the panel in a web browser via the `IP` or `hostname` of your Raspberry PI.
For instance, if your pi is at `10.0.0.210`, is named `c74rpi` and you have a computer on the same network as the pi,
you should be able to view the panel with either of the following URLs:
`http://10.0.0.210:3000` or `http://c74rpi.local:3000`
