# RNBO Runner Debug Interface

This is a small web app made with [Next.js](https://nextjs.org/) that lets you control a RNBO patch exported to the RNBO Runner. You can use this interface to debug RNBO patches sent to your Raspberry Pi (or anywhere the RNBO Runner is active). It will let you set parameters, send MIDI events, send messages to inports and receive them from outports.

## Usage with RNBO

The primary purpose of this page is to help debug a RNBO export once it's running on a Raspberry Pi. It provides a simple interface to most of the endpoints exposed by the RNBO Runner. The interface should automatically include any parameters, inports, and outports in your RNBO patch. Note that this interface is not really intended to be used in a performance, and is mostly a thin wrapper around a handful of API calls to the RNBO Runner.

The RNBO image for the Raspberry Pi includes this debug interface, and runs an HTTP server that serves the page on port 3000. So if your `pi` had the hostname `c74rpi` and the IP address `192.168.88.111`, then from any device on your local network you could visit `http://c74rpi:3000` or `http://192.168.88.1111:3000` to see this page.

## How it Works

The RNBO Runner implements [OSCQuery](https://github.com/Vidvox/OSCQueryProposal), and responds to HTTP requests and WebSocket connections on port 5678. The debug interface opens a WebSocket connection to the RNBO Runner on port 5678 (the default port) and sends OSC messages to it. Using OSCQuery over this connection, the debug interface can get a full list of all inports, outports, and RNBO parameters, including range and enumerated values. The interface uses this list to add sliders and other inputs to the page, with change handlers that will send the appropriate OSC messages to the RNBO Runner.

## Getting Started (Development)

First, run the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Hostname and Port

By default, the app is exposed on port 3000 and tries to connect to port 5678 at the same address as the page itself. So if you load the site at "http://localhost:3000", the page will attempt to form a websocket connection to port 5678 on localhost. You can override this default behavior with the query parameters `h` and `p` for hostname and port, respectively. Connecting to "http://localhost:3000?h=c74rpi.local" will make the page try to make a websocket connection to port 5678 and hostname c74rpi.local.

## Export

You can export the whole site as a static page by running `npm run export`. This will create an "out" directory containing the entire static site. To run this site on a Raspberry Pi (for example), you simple need to start a static web server on the Pi that serves this directory. An easy way to do this is to start an nginx server on the Pi, and to copy the contents of "out" to /var/www/html.

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

## Background

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
