import { Todo } from "./file-parser.ts"
import { existsFixed, IGNORED_PATH_SEGMENTS } from "./watcher.ts"

const todoMap = new Map<string, Todo[]>()

// OTODO: store the todos in the home directory rather than local storage
export function updateStore(todos: Todo[], path: string) {

  if (todos.length > 0) {
    localStorage.setItem(path, JSON.stringify(todos))
  } else if (localStorage.getItem(path)) {
    // here, we previously had todos, but now we don't
    localStorage.removeItem(path)
  }

  // for (let i = 0; i <= localStorage.length; i++) {
  //   const path = localStorage.key(i) as string
  //   const t = JSON.parse(localStorage.getItem(path) as string) as Todo[]
  //   if (path) {
  //     todoMap.set(path, t)
  //   }
  // }
}

export function getStringifiedTodos(): string {
  return JSON.stringify(Array.from(todoMap.entries()))
}

export function removeTodosForPath(path: string) {
  localStorage.removeItem(path)
  todoMap.delete(path)
}

export async function initialiseStore() {
  // cleanup in case that a new ignored path segment was added
  for (const path of Object.keys({ ...localStorage })) {
    if (IGNORED_PATH_SEGMENTS.some(segment => path.includes(segment))) {
      console.log(`removing ignored path: ${path}`)
      removeTodosForPath(path)
    }
    else if (! await existsFixed(path)) {
      console.log(`removing non-existing path: ${path}`)
      removeTodosForPath(path)
    }

    todoMap.set(path, JSON.parse(localStorage.getItem(path) as string) as Todo[])
  }

}