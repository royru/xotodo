import { Todo } from "./file-parser.ts"

const todoMap = new Map<string, Todo[]>()

export function updateStore() {
  // OTODO: store the todos in the home directory rather than local storage
  todoMap.clear()

  for (let i = 0; i <= localStorage.length; i++) {
    const key = localStorage.key(i) as string
    const t = JSON.parse(localStorage.getItem(key) as string) as Todo[]
    if (key) {
      todoMap.set(key, t)
    }
  }
}

export function getStringifiedTodos(): string {
  return JSON.stringify(Array.from(todoMap.entries()))
}