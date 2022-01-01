import { Todo } from "./file-parser.ts"
import { getStringifiedTodos } from "./store.ts"

let websocket: WebSocket

export async function handleRequest(request: Request): Promise<Response> {
  //   body += request.headers.get("user-agent") || "Unknown"
  const { pathname } = new URL(request.url)

  const upgrade = request.headers.get("upgrade") || ""
  if (upgrade.toLowerCase() == "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request)
    websocket = socket

    socket.onopen = () => socket.send(getStringifiedTodos())
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

export function pokeClient() {
  if (websocket && websocket.readyState == websocket.OPEN) {
    websocket.send(getStringifiedTodos())
  }
}