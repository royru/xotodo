import { exists } from "https://deno.land/std/fs/mod.ts"
import { v1 } from "https://deno.land/std@0.91.0/uuid/mod.ts"

const WATCHED_FOLDERS = ["/Volumes/Google Drive/My Drive/Research", "/Users/roy"]

// localStorage.clear()

export interface Todo {
  title: string
  status: 'open' | 'closed' | 'removed'
  id: string
  tsIndexed: Date
  filePath: string
  shortPath: string
}

export async function watch(onUpdate: () => void) {
  const decoder = new TextDecoder("utf-8")
  const watcher = Deno.watchFs(WATCHED_FOLDERS)

  for await (const event of watcher) {
    if (event.paths.length == 0) {
      continue
    }

    for (const path of event.paths) {

      if (path.includes('xotodo') || path.includes('/Library/') || path.includes('.webpack')) {
        // ignore 
        continue
      }

      if (!await exists(path)) {
        if (localStorage.getItem(path) !== null) {
          localStorage.removeItem(path)
          onUpdate()
        }
        continue
      }

      try {
        const data = await Deno.readFile(path)
        const text = decoder.decode(data)
        console.log("parsing file:", path)
        parseFile(text, path, onUpdate)
      } catch (error) {
        console.error(error)
      }
    }
  }
}

function parseFile(text: string, filePath: string, onUpdate: () => void) {
  const lines = text.split('\n')
  const openTodoLines = lines.filter(l => l.includes('OTODO: '))
  const openTodos = parseTodoLinesWith(openTodoLines, filePath, /^(.*)(OTODO: )(.*)/, 'open')
  const closedTodoLines = lines.filter(l => l.includes('XTODO: '))
  const closedTodos = parseTodoLinesWith(closedTodoLines, filePath, /^(.*)(XTODO: )(.*)/, 'closed')
  const todos = openTodos.concat(closedTodos)
  if (todos.length > 0) {
    localStorage.setItem(filePath, JSON.stringify(openTodos.concat(closedTodos)))
    onUpdate()
  }
}

function parseTodoLinesWith(lines: string[], filePath: string, regex: RegExp, status: 'open' | 'closed' | 'removed'): Todo[] {
  const todoStrings = lines.map(l => (regex.exec(l) as string[])[3])
  return todoStrings.map(todo => {
    const id = v1.generate().toString()
    const tsIndexed = new Date()
    let shortPath = filePath
    WATCHED_FOLDERS.forEach(dir => {
      shortPath = shortPath.replace(dir, '')
    })
    return { title: todo, status, id, tsIndexed, filePath, shortPath }
  })
}
