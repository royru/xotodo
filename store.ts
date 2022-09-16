import { Todo } from "./file-parser.ts"
import { existsFixed, IGNORED_PATH_SEGMENTS, WATCHED_FOLDERS } from "./watcher.ts"
import { TodoStore } from "./xotodo-store/pkg/xotodo_store.js"

let store: TodoStore
type Path = string
type TodoDict = Record<Path, Todo[]>

export function updateStore(todos: Todo[], path: string) {
  try {
    if (todos.length > 0) {
      todos = todos.map(t => {
        if (t.dueDate) {
          t.dueDate = new Date(t.dueDate).getTime()
        }
        t.tsIndexed = new Date(t.tsIndexed).getTime()
        return t
      })

      // save the todo item to the wasm/rust store
      store.set_item(path, todos)

    } else if (store.get_item(path)) {
      // here, we previously had todos, but now we don't
      store.remove_item(path)
    }
    write()
  } catch (error) {
    console.error(error)
  }
}

export function getStringifiedTodos(): string {
  const todoDict: TodoDict = store.get_items()

  for (let [path, todos] of Object.entries(todoDict)) {
    todos = todos.map(todo => {
      for (const dir of WATCHED_FOLDERS) {
        todo.filePath = path
      }
      return todo
    })
  }
  return JSON.stringify(todoDict)
}

export async function removeTodosForPath(path: string) {
  store.remove_item(path)
  await write()
}

export async function initialiseStore() {
  // initialize wasm store
  store = new TodoStore()

  const data: TodoDict = await read()
  for (const path of Object.keys(data)) {
    // populate store
    store.set_item(path, data[path])

    // cleanup in case that a new ignored path segment was added
    if (IGNORED_PATH_SEGMENTS.some(segment => path.includes(segment))) {
      console.log(`removing ignored path: ${path}`)
      removeTodosForPath(path)
    }
    else if (! await existsFixed(path)) {
      console.log(`removing non-existing path: ${path}`)
      removeTodosForPath(path)
    }
  }
}

async function read(): Promise<TodoDict> {
  try {
    const decoder = new TextDecoder()
    const data = await Deno.readFile("/Users/roy/Desktop/xo.todo")
    return JSON.parse(decoder.decode(data))
  } catch (error) {
    console.error(error)
    return {}
  }
}

async function write() {
  const todos: TodoDict = store.get_items()
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(todos))
  await Deno.writeFile("/Users/roy/Desktop/xo.todo", data)
}