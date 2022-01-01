import { v1 } from "https://deno.land/std@0.91.0/uuid/mod.ts"
import { parse } from "./xotodo-backend/pkg/xotodo_backend.js"

export interface Todo {
  title: string
  status: 'open' | 'closed'
  id: string
  tsIndexed: Date
  filePath?: string
  shortPath?: string
  lineNumber: number
  dueDate?: Date
}

export function parseFile(text: string): Todo[] {
  const todos = parse(text) as Todo[]
  todos.forEach((t) => {
    t.tsIndexed = new Date(t.tsIndexed)
    t.id = v1.generate().toString()
    t.dueDate = t.dueDate ? new Date(t.dueDate) : undefined
  })
  return todos
}
