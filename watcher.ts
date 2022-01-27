import { exists } from "https://deno.land/std/fs/mod.ts"
import { parseFile, Todo } from "./file-parser.ts"
import { removeTodosForPath } from "./store.ts"

let currentGoogleDrivePath = ''
setTimeout(checkGoogleDrivePath, 60 * 1000)
// initial check
await checkGoogleDrivePath()

// check which google drive path exists at the moment
async function checkGoogleDrivePath() {
  if (await exists('/Volumes/GoogleDrive')) {
    currentGoogleDrivePath = '/Volumes/GoogleDrive'
  } else if (await exists('/Volumes/Google Drive')) {
    currentGoogleDrivePath = '/Volumes/Google Drive'
  } else {
    throw new Error('No Google Drive found')
  }
}

// checks for both possible locations: "/Volumes/GoogleDrive" and "/Volumes/Google Drive"
function googleDriveVolumeFix(path: string): string {
  if (path.includes('/Volumes/GoogleDrive')) {
    return path.replace('/Volumes/GoogleDrive', currentGoogleDrivePath)
  } else if (path.includes('/Volumes/Google Drive')) {
    return path.replace('/Volumes/Google Drive', currentGoogleDrivePath)
  } else {
    return path
  }
}

export function existsFixed(path: string): Promise<boolean> {
  return exists(googleDriveVolumeFix(path))
}

export const WATCHED_FOLDERS = [`${currentGoogleDrivePath}/My Drive/Research`, "/Users/roy"]
export const IGNORED_PATH_SEGMENTS = ["/xotodo", "/Library", "/.", "/xo.todo"]

export async function watch(onUpdate: (todos: Todo[], path: string) => void) {
  try {
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

        if (!await existsFixed(path)) {
          removeTodosForPath(path)
          onUpdate([], path)
          continue
        }

        try {
          const data = await Deno.readFile(path)
          const text = decoder.decode(data)
          console.log("parsing", path)
          const todos = parseFile(text)

          onUpdate(todos, path)

        } catch (_) {
          console.log("parsing failed")
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}