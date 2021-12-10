import { exists } from "https://deno.land/std/fs/mod.ts"
import { v1 } from "https://deno.land/std@0.91.0/uuid/mod.ts"

export interface Todo {
  title: string
  status: 'open' | 'closed' | 'removed'
  id: string
  tsIndexed: Date
  filePath: string
  shortPath: string
  lineNumber: number
  dueDate?: Date
}


const WATCHED_FOLDERS = ["/Volumes/Google Drive/My Drive/Research", "/Volumes/GoogleDrive/My Drive/Research", "/Users/roy"]
const IGNORED_PATH_SEGMENTS = ["xotodo", "/Library", ".webpack", ".seafile-data", ".git"]

type NumberedLine = [lineNumber: number, line: string]

// cleanup in case the any new ignored path segment was added
for (const path of Object.keys({ ...localStorage })) {
  if (IGNORED_PATH_SEGMENTS.some(segment => path.includes(segment))) {
    console.log(`removing ignored path: ${path}`)
    localStorage.removeItem(path)
  }
  else if (! await exists(path)) {
    console.log(`removing non-existing path: ${path}`)
    localStorage.removeItem(path)
  }
}

export async function watch(onUpdate: () => void) {
  const decoder = new TextDecoder("utf-8")
  const watcher = Deno.watchFs(WATCHED_FOLDERS)

  for await (const event of watcher) {
    if (event.paths.length == 0) {
      continue
    }

    for (const path of event.paths) {
      if (IGNORED_PATH_SEGMENTS.some(segment => path.includes(segment))) {
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
        console.log("parsing", path)
        parseFile(text, path, onUpdate)
      } catch (error) {
        console.error(error.message)
      }
    }
  }
}

function parseFile(text: string, filePath: string, onUpdate: () => void) {
  const numberedLines = text.split('\n').map((l, i) => [i, l] as NumberedLine)
  const openTodoLines = numberedLines.filter(nl => nl[1].includes('OTODO: '))
  const openTodos = parseTodoLinesWith(openTodoLines, filePath, /^(.*)(OTODO: )(.*)/, 'open')
  const closedTodoLines = numberedLines.filter(nl => nl[1].includes('XTODO: '))
  const closedTodos = parseTodoLinesWith(closedTodoLines, filePath, /^(.*)(XTODO: )(.*)/, 'closed')
  const todos = openTodos.concat(closedTodos)
  if (todos.length > 0) {
    localStorage.setItem(filePath, JSON.stringify(openTodos.concat(closedTodos)))
    onUpdate()
  } else if (localStorage.getItem(filePath)) {
    // here, we previously had todos, but now we don't
    localStorage.removeItem(filePath)
    onUpdate()
  }
}

function parseTodoLinesWith(lines: NumberedLine[], filePath: string, regex: RegExp, status: 'open' | 'closed' | 'removed'): Todo[] {
  const numberedTodoStrings: [number, string][] = lines.map(nl => {
    const str = (regex.exec(nl[1]) as string[])[3]
    return [nl[0], str]
  })

  return numberedTodoStrings.map(numberedTodo => {
    const lineNumber = numberedTodo[0] + 1
    const str = numberedTodo[1]
    const dateRegex = /@due: (\d\d\d\d-\d\d-\d\d)/
    let dueDate: Date | undefined
    if (dateRegex.test(str)) {
      const dateStr = (dateRegex.exec(str) as string[])[1]
      dueDate = new Date(dateStr)
    }
    const title = str.replace(dateRegex, '')
    const id = v1.generate().toString()
    const tsIndexed = new Date()
    let shortPath = filePath
    WATCHED_FOLDERS.forEach(dir => {
      shortPath = shortPath.replace(dir, '')
    })
    console.log(`\textracted: ${title} @L${lineNumber}`)
    return { title, status, id, tsIndexed, filePath, shortPath, lineNumber, dueDate }
  })
}
