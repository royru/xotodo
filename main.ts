import { Todo, watch } from "./watcher.ts"
import { serve } from "https://deno.land/std@0.114.0/http/server.ts"

let websocket: WebSocket

async function handleRequest(request: Request): Promise<Response> {
  //   body += request.headers.get("user-agent") || "Unknown"
  const { pathname } = new URL(request.url)

  const upgrade = request.headers.get("upgrade") || ""
  if (upgrade.toLowerCase() == "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request)
    websocket = socket
    socket.onopen = () => socket.send(JSON.stringify(Array.from(todoMap.entries())))
    socket.onmessage = (e) => {
      // console.log("socket message:", e.data)
    }
    socket.onerror = (e) => console.log("socket errored:", e)
    socket.onclose = () => console.log("socket closed")
    return response
  }

  // This is how the server works:
  // 1. A request comes in for a specific asset.
  // 2. We read the asset from the file system.
  // 3. We send the asset back to the client.

  // Check if the request is for style.css.
  if (pathname.startsWith("/style.css")) {

    // Read the style.css file from the file system.
    const file = await Deno.readFile("./web/style.css")
    // Respond to the request with the style.css file.
    return new Response(file, {
      headers: {
        "content-type": "text/css",
      },
    })
  }

  if (pathname.endsWith(".js")) {

    // Read the style.css file from the file system.
    const file = await Deno.readFile(`./web/${pathname}`)
    // Respond to the request with the style.css file.
    return new Response(file, {
      headers: {
        "content-type": "application/javascript",
      },
    })
  }


  return new Response(
    `<html>
    <head>
    <link rel="stylesheet" href="style.css" />
    <script type="module" src="index.js"></script>
    </head>
    <body>  
    </body>
    </html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    },
  )
}

const todoMap = new Map<string, Todo[]>()

console.log("Listening on http://localhost:8000")
serve(handleRequest)

// import { colors, Table, tty } from "./deps.ts"
// import { prompt, Input, Number, Confirm, Checkbox } from "./deps.ts"
// localStorage.clear()

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

watch(onUpdate)

// start
onUpdate()
