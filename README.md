# XOTODO

## Run
```
deno run --allow-read --allow-net --unstable --watch main.ts
```

## Compile
```
deno compile --allow-read --allow-net --unstable main.ts
```

Currently doesn't work: https://github.com/denoland/deno/issues/10693

## Debug in Firefox
``` 
Applications/Firefox.app/Contents/MacOS/firefox -start-debugger-server
```

Next, use the debugger in VS Code