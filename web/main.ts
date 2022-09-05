import { startPolling } from './api.ts'
import { renderOpenTodos } from './render.ts'

startPolling(renderOpenTodos)

