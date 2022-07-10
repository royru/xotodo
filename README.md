# XOTODO

## Run

In `./xotodo-edit`, run `trunk build`. Then...

```
deno run --allow-read --allow-run --allow-write --allow-net --unstable --watch main.ts
```

## Test
```
deno test --unstable --allow-read
```

## Compile

```
deno compile --allow-read --allow-write --allow-run --allow-net --unstable main.ts
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
- @topic @project
- GitHub issues integration
- tiles layout
- "my todos for today" - high-level goals of today
- extension: @due: data auto-complete
- sort user interface by topic/folder name/due date