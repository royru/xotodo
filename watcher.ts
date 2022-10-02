import { exists } from "https://deno.land/std/fs/mod.ts"
import { parseFile } from "./file-parser.ts"
import { Todo } from "./todo.ts"
import { removeTodosForPath } from "./store.ts"
import config from "./xotodo.config.json" assert { type: "json" }

export async function watch(onUpdate: (todos: Todo[], path: string) => void) {
  const watcher = Deno.watchFs(config.watchedFolders)
  for await (const event of watcher) {
    if (event.paths.length == 0) {
      continue
    }

    for (const path of event.paths) {
      if (config.ignoredPathSegments.some(segment => path.includes(segment))) {
        // ignore
        continue
      }

      if (!await exists(path)) {
        removeTodosForPath(path)
        onUpdate([], path)
        continue
      }

      try {
        const text = await Deno.readTextFile(path)
        const todos = parseFile(text, path)
        console.log("parsed", path)
        onUpdate(todos, path)
      } catch (_) {
        console.error(`parsing failed for ${path}`)
      }
    }
  }
}