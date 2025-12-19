# RNBO Runner Web Interface - Client

This workspace contains the Web Interface Client code. It is developed in [typescript](https://www.typescriptlang.org/) with [vite](https://vite.dev/).

## Export

You can export the whole site as a static page by running `npm run build`. This will create an "out" directory containing the entire static site. To run this site on a Raspberry Pi (for example), you simple need to start a static web server on the Pi that serves this directory. An easy way to do this is to start an nginx server on the Pi, and to copy the contents of "out" to /var/www/html.
