import { startSocket } from './socket.js'
import { renderOpenTodos } from './render.js'

startSocket(renderOpenTodos)

