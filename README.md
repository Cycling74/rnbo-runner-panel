# RNBO Runner Web Interface

This is a web app that lets you control the graph and patches exported to a RNBO Runner. You can use this interface to manage, change and interact with the running graph as well as exported RNBO patches on the device. It will let you set build audio graphs, change parameters, send MIDI events, send messages to inports and receive them from outports and more.

## Usage with RNBO

The primary purpose of this app is to provide a visual interface to interact with a running RNBO runner, eg on a Raspberry Pi. It provides a simple interface to most of the endpoints exposed by the RNBO Runner. The interface should automatically include any parameters, inports, and outports in your RNBO patch. Note that this interface is not really intended to be used as a performance tool and while it's possible, it is not optimized for live interaction.

The RNBO image for the Raspberry Pi includes this application, and runs an HTTP server that serves the page on port 3000. So if your `pi` had the hostname `c74rpi` and the IP address `192.168.88.111`, then from any device on your local network you could visit `http://c74rpi:3000` or `http://192.168.88.1111:3000` to see this page.

## How it Works

The RNBO Runner implements [OSCQuery](https://github.com/Vidvox/OSCQueryProposal), and responds to HTTP requests and WebSocket connections on port 5678. The Runner Web Interface opens a WebSocket connection to the RNBO Runner on port 5678 (the default port) and sends OSC messages to it. Using OSCQuery over this connection, the application displays the currently loaded graph, devices, their parameters and more. Using the OSCQuery API as a basis the application allows to interact with the RNBO runner by sending and receiving OSC messages via its WebSocket connection.

## The Pieces

This repository contains the two, somewhat loosely coupled projects of the Web Interface, namely:

* [Client](./client/) - A React + Vite based Web application that represent the client-side application to interact and communicate with the state of a RNBO runner.
* [Server](./server/) -  A Rust based server that in a release version hosts the static files necessary for the client application, and in addition also provides HTTP endpoints to perform file uploads to and downloads from a RNBO runner.

In development one can sort of work on either parts of the package in isolation as the client communicates with a RNBO runner in the network. In the final package the Rust server is responsible for providing not only the API but also for serving the static files of the client application.

## Hostname and Port

By default, the app is exposed on port 3000 and tries to connect to port 5678 at the same address as the page itself. So if you load the site at "http://localhost:3000", the page will attempt to form a websocket connection to port 5678 on localhost. You can override this default behavior with the query parameters `h` and `p` for hostname and port, respectively. Connecting to "http://localhost:3000?h=c74rpi.local" will make the page try to make a websocket connection to port 5678 and hostname c74rpi.local. The endpoint is also shown in the endpoint info modal (available via the header in the application) and you can set a different hostname and port to connect to a runner that's not running on the same device / hostname as the Runner Web interface.

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
For instance, if your pi is at `10.0.0.210`, is named `c74rpi` and you have a computer on the same network as the pi, you should be able to view the panel with either of the following URLs:
`http://10.0.0.210:3000` or `http://c74rpi.local:3000`


## Dev Guide

### Dependencies

* [npm](https://www.npmjs.com/package/npm)
* [rust](https://doc.rust-lang.org/book/ch01-01-installation.html)

### Running

If you have the dependencies installed, you can install packages via:

```shell
npm ci
```

#### Client

To start the web application in development mode run:

```shell
npm run dev:client
```

This will start a Vite Development server with hot module reloading enabled that one can use to work on the client web application. The Rust web server is not needed to be running as the app will connect to an instance of a RNBO runner and assumes that the Rust server / API will be available alongside the OSCQuery API on the same host.

In order to connect to a runner in your network you can either use the endpoint dialouge from the UI or simply open the web app using query params, eg the following for a hostname `c74rpi` that has the OSCQuery Websocket running on port `5678`:

```
http://localhost:5173/?h=c74rpi&p=5678
```

#### Server

To start the Rust server, first build the static client files and run it in development mode using:

```shell
npm run build:client
npm run dev:server
```

The first time this will take a while as it will need to download and build a number of rust packages.

Once the server is built and running, open `http://localhost:3000` in your web browser.

## Building deb

**Requirements**

* `dpkg-deb`
  * `apt-get install dpkg` (likely already installed)
  * `brew install dpkg`

```shell
npm run package:debian-armv7
npm run package:debian-aarch64
```

You should then see a `.deb` file in your working directory.

## Release Notes / Changeset Management

This repo uses [changesets](https://github.com/changesets/changesets) to manage versioning and release notes via Pull Requests. Please perform your work on branches and create a Pull Request to land them into the `develop` branch. Each pull request can thereby define and describe the changes with changsets messages, additionally a bot will highlight on the PR if there are changesets present for the work.

We organise the repo using npm workspaces with a distinct package for the server and the client. The versions of both packages however are linked and therefore tightly coupled. This also allows to maintain distinct changelogs for the client as well as the server.

To add a changeset to your branch run `npm run changeset` and follow the cli instructions. This will create a `.md` file in `.changeset`. Feel free to manually edit the descriptive text in the file whilst working on your branch.

We accumulate changes on the `develop` branch with distinct `changeset` files describing the work that has happened. Once that work is ready for a release:

1. Create a PR from `develop` to `main`
2. The CI will run and ensure the work can be merged and successfully builds
3. Once this PR gets merged to `main` it triggers a build and release
4. A merge-back PR from `main` to `develop` is created in order to get the version bump and updated changelog onto the dev branch
