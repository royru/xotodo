import { Application, Router } from "https://deno.land/x/oak/mod.ts"
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

// .get("/api/:id", (ctx) => {
//   console.log(ctx?.params?.id)
//   ctx.response.body = "test /"
// })

app.use(router.routes())
app.use(router.allowedMethods())

//   Deno.run({ cmd: ["code", "-g", `${todo.filePath}:${todo.lineNumber || 0}`] })
