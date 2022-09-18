// import { v1 } from "https://deno.land/std@0.91.0/uuid/mod.ts"
import { parse } from "./xotodo-parser/pkg/xotodo_parser.js"

// don't forget to keep in sync with rust struct
export interface Todo {
  title: string
  status: 'open' | 'closed'
  tsIndexed: string // naive date time string of format "YYYY-MM-DD HH:MM:SS"
  filePath: string
  lineNumber: number
  dueDate?: string // rust naive date of string format YYYY-MM-DD
  project: string
}

export function parseFile(text: string, filePath: string): Todo[] {
  return parse(text, filePath) as Todo[]
}
