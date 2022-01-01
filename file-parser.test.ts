import { assertEquals } from "https://deno.land/std@0.119.0/testing/asserts.ts"
import { parseFile } from "./file-parser.ts"
import init from "./xotodo-backend/pkg/xotodo_backend.js"

async function setup(): Promise<string> {
  await init(Deno.readFile("xotodo-backend/pkg/xotodo_backend_bg.wasm"))
  const data = await Deno.readFile("./test.md")
  const decoder = new TextDecoder("utf-8")
  const text = decoder.decode(data)
  return text
}

Deno.test({
  name: "parsing multiple lines",
  fn: async () => {
    const text = await setup()
    const todos = parseFile(text)
    assertEquals(todos.length, 3)
    assertEquals(todos[2].status, 'closed')
    assertEquals(todos[2].lineNumber, 23)
  },
})

Deno.test({
  name: "parsing invalid date",
  fn: async () => {
    await setup()
    const todos = parseFile("OTODO: test @due:2021-99-32")
    assertEquals(todos.length, 1)
    assertEquals(todos[0].dueDate, undefined)
  },
})