import { exists } from "https://deno.land/std/fs/mod.ts"
import { parseFile } from "./file-parser.ts"

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

function existsFixed(path: string): Promise<boolean> {
  return exists(googleDriveVolumeFix(path))
}

const WATCHED_FOLDERS = [`${currentGoogleDrivePath}/My Drive/Research`, "/Users/roy"]
const IGNORED_PATH_SEGMENTS = ["/xotodo", "/Library", "/."]

// cleanup in case the any new ignored path segment was added
for (const path of Object.keys({ ...localStorage })) {
  if (IGNORED_PATH_SEGMENTS.some(segment => path.includes(segment))) {
    console.log(`removing ignored path: ${path}`)
    localStorage.removeItem(path)
  }
  else if (! await existsFixed(path)) {
    console.log(`removing non-existing path: ${path}`)
    localStorage.removeItem(path)
  }
}

export async function watch(onUpdate: () => void) {
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
          const todos = parseFile(text)

          WATCHED_FOLDERS.forEach((dir: string) => {
            todos.forEach(t => {
              t.filePath = path
              t.shortPath = path.replace(dir, '')
            })
          })

          if (todos.length > 0) {
            localStorage.setItem(path, JSON.stringify(todos))
            onUpdate()
          } else if (localStorage.getItem(path)) {
            // here, we previously had todos, but now we don't
            localStorage.removeItem(path)
            onUpdate()
          }

        } catch (_) {
          console.log("parsing failed")
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}