import { watch } from "./watcher.ts"
import { serve } from "https://deno.land/std@0.114.0/http/server.ts"
import initRustParser from "./xotodo-parser/pkg/xotodo_parser.js"
import initRustStore from "./xotodo-store/pkg/xotodo_store.js"
import { handleRequest, pokeClient } from "./server.ts"
import { initialiseStore, updateStore } from "./store.ts"
import { Todo } from "./file-parser.ts"

async function onUpdate(todos: Todo[], path: string) {
  await updateStore(todos, path)
  pokeClient()
}

// https://github.com/rustwasm/wasm-pack/issues/672
await initRustParser(Deno.readFile("xotodo-parser/pkg/xotodo_parser_bg.wasm"))
await initRustStore(Deno.readFile("xotodo-store/pkg/xotodo_store_bg.wasm"))
await initialiseStore()

// start server and watcher
watch(onUpdate)
serve(handleRequest)

console.log("Listening on http://localhost:8000")