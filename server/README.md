# rnbo-runner-panel server

Built in rust using [rocket](https://rocket.rs/)

## Cross Compiling for RPI

On osx, get the linker we need:

```
brew tap messense/macos-cross-toolchains
brew install aarch64-unknown-linux-gnu
```

### 64-bit

```
rustup target add aarch64-unknown-linux-gnu
cargo build --target=aarch64-unknown-linux-gnu --release
```

### 32-bit

```
rustup target add armv7-unknown-linux-gnueabihf
cargo build --target=armv7-unknown-linux-gnueabihf --release
```
