import { watch } from "./watcher.ts"
import { serve } from "https://deno.land/std@0.114.0/http/server.ts"
import init from "./xotodo-backend/pkg/xotodo_backend.js"
import { Todo } from "./file-parser.ts"

let websocket: WebSocket
const todoMap = new Map<string, Todo[]>()

async function handleRequest(request: Request): Promise<Response> {
  //   body += request.headers.get("user-agent") || "Unknown"
  const { pathname } = new URL(request.url)

  const upgrade = request.headers.get("upgrade") || ""
  if (upgrade.toLowerCase() == "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request)
    websocket = socket

    socket.onopen = () => socket.send(JSON.stringify(Array.from(todoMap.entries())))
    socket.onerror = (e) => console.log("socket errored:", e)
    socket.onclose = () => console.log("socket closed")

    socket.onmessage = (e: MessageEvent) => {
      const todo: Todo = JSON.parse(e.data)
      Deno.run({ cmd: ["code", "-g", `${todo.filePath}:${todo.lineNumber || 0}`] })
    }

    return response
  }

  // Check if the request is for style.css.
  if (pathname.startsWith("/style.css")) {
    const file = await Deno.readFile("./web/style.css")
    return new Response(file, {
      headers: { "content-type": "text/css" },
    })
  }

  if (pathname.endsWith(".js")) {
    const file = await Deno.readFile(`./web/${pathname}`)
    return new Response(file, {
      headers: { "content-type": "application/javascript" },
    })
  }

  return new Response(
    `<html>
    <head>
      <link rel="stylesheet" href="style.css" />
      <script type="module" src="index.js"></script>
    </head>
    <body></body>
    </html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  )
}

function onUpdate() {
  todoMap.clear()

  for (let i = 0; i <= localStorage.length; i++) {
    const key = localStorage.key(i) as string
    const t = JSON.parse(localStorage.getItem(key) as string) as Todo[]
    if (key) {
      todoMap.set(key, t)
    }
  }

  if (websocket && websocket.readyState == websocket.OPEN) {
    websocket.send(JSON.stringify(Array.from(todoMap.entries())))
  }
}

// start
serve(handleRequest)

// https://github.com/rustwasm/wasm-pack/issues/672
await init(Deno.readFile("xotodo-backend/pkg/xotodo_backend_bg.wasm"))

watch(onUpdate)
onUpdate()

console.log("Listening on http://localhost:8000")