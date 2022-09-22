// import { v1 } from "https://deno.land/std@0.91.0/uuid/mod.ts"
import * as path from "https://deno.land/std/path/mod.ts"
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
  const project = parseProject(filePath)
  const todos = parse(text, filePath) as Todo[]
  return todos.map(t => {
    t.project = project
    return t
  })
}

// default project name is either the name of the git directory or the parent folder name
function parseProject(filePath: string): string {
  const parts = filePath.split('/')
  for (let i = 0; i < parts.length; i++) {
    try {
      const dir = path.join(...parts.slice(0, parts.length - i))
      const gitDir = path.join(dir, '.git')
      Deno.readDirSync("/" + gitDir)
      return parts[parts.length - i - 1] // .git exists
    } catch (_) {
      // not a (git) directory, keep going
    }
  }
  // did not find a git repo, default to the directory name
  return parts[parts.length - 2]
}
