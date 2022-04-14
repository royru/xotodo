import { startPolling } from './api.js'
import { renderOpenTodos } from './render.js'

startPolling(renderOpenTodos)

