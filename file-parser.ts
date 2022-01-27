// import { v1 } from "https://deno.land/std@0.91.0/uuid/mod.ts"
import { parse } from "./xotodo-parser/pkg/xotodo_parser.js"

export interface Todo {
  title: string
  status: 'open' | 'closed'
  tsIndexed: number
  filePath?: string
  shortPath?: string
  lineNumber: number
  dueDate?: number
}

export function parseFile(text: string): Todo[] {
  const todos = parse(text) as Todo[]
  todos.forEach((t) => {
    t.tsIndexed = new Date(t.tsIndexed).getTime()
    // t.id = v1.generate().toString()
    t.dueDate = t.dueDate ? new Date(t.dueDate).getTime() : undefined
  })
  return todos
}
