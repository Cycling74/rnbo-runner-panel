# rnbo-runner-panel server

Built in rust using [rocket](https://rocket.rs/), this server serves the static html produced in the 
top level project and also a basic file server that allows for upload, download and deletion files for
the [rnbo.oscquery.runner](https://github.com/Cycling74/rnbo.oscquery.runner)

The server can also tell the runner to "packages", which are tar files that can be downloaded from one
compute and sent to another to be installed.

The file server and package creation via HTTP greatly simplifies file transfer to/from the runner, which 
was previously using a bespoke [OSC](https://en.wikipedia.org/wiki/Open_Sound_Control) based protocol. The
server does communicate with the runner via that same protocol, but the messaging needed is simple.

## Dependencies

You need [rust](https://rustup.rs/) which comes with `cargo`.

There is a script that updates the `Cargo.toml` version when you run `npm version` at the top level.
That requires `cargo-edit`:

```
cargo install cargo-edit
```

After that you can run:

```
cargo run
```

## Cross Compiling for RPI

Using [cross](https://github.com/cross-rs/cross)

```
cargo install cross --git https://github.com/cross-rs/cross
```

### 64-bit

```
cross build --target aarch64-unknown-linux-gnu --release
```

### 32-bit

```
cross build --target armv7-unknown-linux-gnueabihf --release
```

### Actions

[build-rust-projects-with-cross](https://github.com/marketplace/actions/build-rust-projects-with-cross)

## License

See the [MIT License File](../LICENSE.txt) in the top level project.
