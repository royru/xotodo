import { watch } from "./watcher.ts"
import initRustParser from "./xotodo-parser/pkg/xotodo_parser.js"
import initRustStore from "./xotodo-store/pkg/xotodo_store.js"
import { initServer } from "./server.ts"
import { initialiseStore, updateStore } from "./store.ts"

// https://github.com/rustwasm/wasm-pack/issues/672
await initRustParser(Deno.readFile("xotodo-parser/pkg/xotodo_parser_bg.wasm"))
await initRustStore(Deno.readFile("xotodo-store/pkg/xotodo_store_bg.wasm"))
await initialiseStore()

// start server and watcher
await initServer()
watch(updateStore)