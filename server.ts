import { Application, Router, helpers } from "https://deno.land/x/oak/mod.ts"
import { getStringifiedTodos } from "./store.ts"

const app = new Application()
const router = new Router()

export function initServer() {
  app.listen({ port: 8000 })
  console.log('Listening on http://localhost:8000')
}

app.use(async (context, next) => {
  try {
    await context.send({
      root: `web`,
      index: "index.html",
    })
  } catch {
    next()
  }
})

router
  .get("/api/todos", (ctx) => {
    ctx.response.body = getStringifiedTodos()
  })
  .get("/api/file", (ctx) => {
    const { path, line } = helpers.getQuery(ctx)
    const content = Deno.readTextFileSync(path)
    ctx.response.body = { file_path: path, content, selected_line: Number.parseInt(line) }
  })
  .post("/api/complete", (ctx) => {
    const { path, line } = helpers.getQuery(ctx)
    const content = Deno.readTextFileSync(path)
    const lines = content.split('\n')
    const index = Number.parseInt(line)
    if (lines.length >= index && lines[index].includes('OTODO:')) {
      lines[index] = lines[index].replace('OTODO:', 'XTODO:')
      Deno.writeTextFileSync(path, lines.join('\n'))
      ctx.response.body = "ok"
    } else {
      console.error("Invalid line number. No OTODO found.")
      Deno.exit()
    }
    // console.log(ctx.request.hasBody)
    // const res = ctx.request.body()
    // console.log(res.type)
    // console.log(await res.value)
    // ctx.response.body = "ok"
  })

app.use(router.routes())
app.use(router.allowedMethods())

//   Deno.run({ cmd: ["code", "-g", `${todo.filePath}:${todo.lineNumber || 0}`] })
