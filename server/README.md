# rnbo-runner-panel server

Built in rust using [rocket](https://rocket.rs/)

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
