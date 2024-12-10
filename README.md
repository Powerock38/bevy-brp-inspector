# Bevy BRP Inspector

This tool aims to be a cheap alternative to [the WorldInspectorPlugin of **bevy-inspector-egui**](https://github.com/jakobhellermann/bevy-inspector-egui).

It lists all the entities present in the `World` with their respective components, `Children` and `Parent` if present.

## Usage

1. Enable the `bevy_remote` feature in your `Cargo.toml` and add these two plugins to you `App` configuration:

```rust
    .add_plugins((
      RemotePlugin::default(),
      RemoteHttpPlugin::default().with_header("Access-Control-Allow-Origin", "*"),
    ))
```

2. Go to https://powerock38.github.io/bevy-brp-inspector/
3. Enjoy the cutting-edge UI technology

## Known issues
- Doesn't list `Resource`s (not possible with BRP (yet?))
- Can't filter out `Observer` and `SystemIdMarker` entities (BRP says that these components don't exist)
- The code is horrible
