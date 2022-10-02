import { Todo } from "./todo.ts"
import config from './xotodo.config.json' assert { type: "json" }
import { TodoStore } from "./xotodo-store/pkg/xotodo_store.js"

let store: TodoStore
type Path = string
type TodoDict = Record<Path, Todo[]>

export function updateStore(todos: Todo[], path: string) {
  try {
    if (todos.length > 0) {
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
      for (const _dir of config.watchedFolders) {
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
    if (config.ignoredPathSegments.some(segment => path.includes(segment))) {
      console.log(`removing ignored path: ${path}`)
      removeTodosForPath(path)
    }

    try {
      // throw error if file doesn't exist
      await Deno.stat(path)
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        console.log(`removing non-existing path: ${path}`)
        removeTodosForPath(path)
      }
    }
  }
}

async function read(): Promise<TodoDict> {
  try {
    const data = await Deno.readTextFile(config.todoFileName)
    return JSON.parse(data)
  } catch (error) {
    console.error(error)
    return {}
  }
}

async function write() {
  const todos: TodoDict = store.get_items()
  await Deno.writeTextFile(config.todoFileName, JSON.stringify(todos))
}