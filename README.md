# RNBO Runner Panel

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This app provides a web interface for running instances of the RNBO OSCQuery Runner. It lets the user set parameters, send MIDI events, and send messages to inports.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

## Hostname and Port

By default, the app is exposed on port 3000 and tries to connect to port 5678 at the same address as the page itself. So if you load the site at "http://localhost:3000", the page will attempt to form a websocket connection to port 5678 on localhost. You can override this default behavior with the query parameters `h` and `p` for hostname and port, respectively. Connecting to "http://localhost:3000?h=c74rpi.local" will make the page try to make a websocket connection to port 5678 and hostname c74rpi.local.

## Export

You can export the whole site as a static page by running `yarn run export`. This will create an "out" directory containing the entire static site. To run this site on a Raspberry Pi (for example), you simple need to start a static web server on the Pi that serves this directory. An easy way to do this is to start an nginx server on the Pi, and to copy the contents of "out" to /var/www/html.

## Building deb

**Requirements**

* `dpkg-deb`
  * `apt-get install dpkg` (likely already installed)
  * `brew install dpkg`

```shell
yarn run build && yarn run export && yarn run package-debian
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

