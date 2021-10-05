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

By default, the app tries to connect to port 5678 at the same address as the page itself. So if you load the site at "http://localhost:3000", the page will attempt to form a websocket connection to port 5678 on localhost. You can override this default behavior with the query parameters `h` and `p` for hostname and port, respectively. Connecting to "http://localhost:3000?h=c74rpi.local" will make the page try to make a websocket connection to port 5678 and hostname c74rpi.local.

## Export

You can export the whole site as a static page by running `yarn run export`. This will create an "out" directory containing the entire static site. To run this site on a Raspberry Pi (for example), you simple need to start a static web server on the Pi that serves this directory. An easy way to do this is to start an nginx server on the Pi, and to copy the contents of "out" to /var/www/html.

## Building deb

**Requirements**

* `dpkg-deb`
  * `apt-get install dpkg` (likely already installed)
  * `brew install dpkg`

```shell
yarn run export && yarn run package-debian
```

You should then see a `.deb` file in your working directory.
