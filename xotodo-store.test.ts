import { assertEquals, assertIsError } from "https://deno.land/std@0.119.0/testing/asserts.ts"
import init, { TodoStore } from "./xotodo-store/pkg/xotodo_store.js"

async function setup() {
  await init(Deno.readFile("xotodo-store/pkg/xotodo_store_bg.wasm"))
}

const item = {
  title: "testibus",
  lineNumber: 12,
  tsIndexed: new Date().getTime(),
  status: "closed",
  dueDate: new Date().getTime()
}

await setup()

Deno.test({
  name: "storing a todo",
  fn: () => {
    const store = new TodoStore()
    store.set_item("/my/test/path", [item])
    const todos = store.get_items()
    assertEquals(Object.keys(todos).length, 1)
    assertEquals(todos["/my/test/path"][0].lineNumber, 12)
  },
})

Deno.test({
  name: "cannot pass Date object",
  fn: () => {
    const store = new TodoStore()

    try {
      store.set_item("/my/test/path", [{
        title: "testibus",
        lineNumber: 12,
        tsIndexed: new Date(), // currently, cannot pass Date object
        status: "closed",
        dueDate: new Date().getTime()
      }])
    } catch (error) {
      assertIsError(error)
    }

    assertEquals(Object.keys(store.get_items()).length, 0)
  },
})

Deno.test({
  name: "remove item",
  fn: () => {
    const store = new TodoStore()
    store.set_item("/my/test/path", [item])
    store.remove_item("/my/test/path")
    const todos = store.get_items()
    assertEquals(Object.keys(todos).length, 0)
  },
})

Deno.test({
  name: "cannot get non-existing item ",
  fn: () => {
    const store = new TodoStore()
    const todos = store.get_item("/my/test/path")
    assertEquals(todos, null)
    assertEquals(Object.keys(store.get_items()).length, 0)
  },
})

Deno.test({
  name: "get item",
  fn: () => {
    const store = new TodoStore()
    store.set_item("/my/test/path", [item])
    const todos = store.get_item("/my/test/path")
    assertEquals(todos[0].lineNumber, 12)
  },
})