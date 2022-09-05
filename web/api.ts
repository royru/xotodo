import { Todo } from "../file-parser.ts"

type Path = string
export type TodoDict = Record<Path, Todo[]>

export function startPolling(onTodosReceived: (todos: TodoDict) => void) {
  getData() // initial call
  setInterval(getData, 300000)

  async function getData() {
    const res = await fetch('/api/todos')
    const todos = await res.json()
    onTodosReceived(todos)
  }
}