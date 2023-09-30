import { Todo } from "../todo.ts"
import { renderOpenTodos } from './render.ts'

type Path = string
export type TodoDict = Record<Path, Todo[]>

export function startPolling() {
  getData() // initial call
  setInterval(getData, 30000)
}

async function getData() {
  const res = await fetch('/api/todos')
  const todos = await res.json()
  renderOpenTodos(todos)
}

export async function completeTodo(path: string, line: number) {
  await send('/api/complete', { path, line })
}

export async function openFile(path: string) {
  await send('/api/open', { path, line: 0 })
}

export async function incrementDueDate(path: string, line: number) {
  console.log(incrementDueDate)
  await send('/api/increment', { path, line })
}

async function send(urlPath: string, q: { path: string, line: number }) {
  const { path, line } = q
  const url = new URL(urlPath, location.origin)
  url.search = new URLSearchParams({ path, line: (line - 1).toString() }).toString()
  await fetch(url.toString())
  getData()
}