# XOTODO

## Run

1. In `./xotodo-edit`, run `trunk build`.
2. In `./xotodo-parser` and `./xotodo-store`. run `wasm-pack build target --web`.
3. `deno bundle --config web/deno.json web/main.ts web/lib/bundle.js`
4. Start the system: 

```
deno run --allow-read --allow-run --allow-write --allow-net --watch main.ts
```

## Test
```
deno test --allow-read
```

Alternatively, navigate to a rust crate and run `cargo test`

## Compile

```
deno compile --allow-read --allow-write --allow-run --allow-net main.ts
```

Currently doesn't work: https://github.com/denoland/deno/issues/10693

## Compile Rust Components

```
cd xotodo-edit
trunk build
```

## Debug in Firefox
``` 
Applications/Firefox.app/Contents/MacOS/firefox -start-debugger-server
```

Next, use the debugger in VS Code

### BACKLOG
- Inline (in-browser) editing of todos 
- @topic
- GitHub issues integration
- "my focus for today" - high-level goals to focus on today
- extension: @due: data auto-complete
- sort user interface either by topic, folder or dueDate
- extract all hard-coded filepaths and make it configurable