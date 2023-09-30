import { Application, Router, helpers } from "https://deno.land/x/oak@v10.5.1/mod.ts"
import { getStringifiedTodos } from "./store.ts"
import config from "./xotodo.config.json" assert { type: "json" }

const app = new Application()
const router = new Router()

export function initServer() {
  app.listen({ port: config.port })
  console.log(`Listening on http://localhost:${config.port}`)
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
  .post("/api/remove", (ctx) => {
    const { path, line } = helpers.getQuery(ctx)
    const content = Deno.readTextFileSync(path)
    const lines = content.split('\n')
    const index = Number.parseInt(line)
    if (lines.length >= index && (lines[index].includes('OTODO:') || lines[index].includes('XTODO:'))) {
      lines.splice(index, 1)
      Deno.writeTextFileSync(path, lines.join('\n'))
      ctx.response.body = "ok"
    } else {
      console.error("Invalid line number. No (XO)TODO found.")
      Deno.exit()
    }
  })
  .get("/api/open", (ctx) => {
    const { path } = helpers.getQuery(ctx)
    Deno.run({ cmd: ["open", path] })
    ctx.response.body = "ok"
  })
  .get("/api/increment", (ctx) => {
    const { path, line } = helpers.getQuery(ctx)
    const content = Deno.readTextFileSync(path)
    const lines = content.split('\n')
    const index = Number.parseInt(line)
    // example line would be "OTODO: this is a test @due: 2021-03-01 by midnight"
    if (lines.length >= index && lines[index].includes('@due:')) {
      try {
        const dueDateStr = lines[index].split('@due:')[1].trim().substring(0, 10)
        const dueDate = new Date(dueDateStr)
        dueDate.setDate(dueDate.getDate() + 1)
        const newDueDateStr = dueDate.toISOString().substring(0, 10)
        lines[index] = lines[index].replace(dueDateStr, newDueDateStr)
        Deno.writeTextFileSync(path, lines.join('\n'))
        ctx.response.body = "ok"
      } catch (error) {
        console.error("Invalid date.", error)
        Deno.exit()
      }
    } else {
      console.error("Invalid line number. No @due: found.")
      Deno.exit()
    }
  })
  .get("/api/complete", (ctx) => {
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
  })

app.use(router.routes())
app.use(router.allowedMethods())

//   Deno.run({ cmd: ["code", "-g", `${todo.filePath}:${todo.lineNumber || 0}`] })
