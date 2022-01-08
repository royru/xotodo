import { watch } from "./watcher.ts"
import { serve } from "https://deno.land/std@0.114.0/http/server.ts"
import init from "./xotodo-backend/pkg/xotodo_backend.js"
import { handleRequest, pokeClient } from "./server.ts"
import { initialiseStore, updateStore } from "./store.ts"
import { Todo } from "./file-parser.ts"

function onUpdate(todos: Todo[], path: string) {
  updateStore(todos, path)
  pokeClient()
}

// start
serve(handleRequest)

// https://github.com/rustwasm/wasm-pack/issues/672
await init(Deno.readFile("xotodo-backend/pkg/xotodo_backend_bg.wasm"))

watch(onUpdate)
initialiseStore()

console.log("Listening on http://localhost:8000")