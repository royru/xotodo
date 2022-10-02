// boilerplate script to migrate outdated data structure to an updated one - run if needed:
// deno run --allow-read --allow-write scripts/store-migration.ts

import { Todo } from "../todo.ts"
import config from "../xotodo.config.json" assert { type: "json" }

type filename = string

const todoRec: Record<filename, Todo[]> = JSON.parse(await Deno.readTextFile(config.todoFileName))

Object.entries(todoRec).forEach(([fp, todos]) => {
  todos.forEach(todo => {
    // if (todo.dueDate) {
    //   todo.dueDate = toNaiveDateStr(new Date(todo.dueDate))
    // } else {
    //   todo.dueDate = ""
    // }
    // todo.tsIndexed = toNaiveDateTimeStr(new Date(todo.tsIndexed))
    // todo.project = "" 
    if (!todo.filePath) {
      todo.filePath = fp
    }
  })
})

await Deno.writeTextFile("/Users/roy/Desktop/xo.todo", JSON.stringify(todoRec))

// const pad = (n: number) => n.toString().padStart(2, "0")
// function toNaiveDateStr(d: Date): string {
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
// }

// function toNaiveDateTimeStr(d: Date): string {
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
// }