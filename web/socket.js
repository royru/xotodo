export function startSocket(onTodosReceived) {

  // Create WebSocket connection.
  const socket = new WebSocket('ws://localhost:8000')

  // Connection opened
  socket.addEventListener('open', function (_) {
    // socket.send('Hello Server!')
    console.log('socket connection is open')
  })

  // Listen for messages
  socket.addEventListener('message', function (event) {
    const todos = new Map(JSON.parse(event.data))
    onTodosReceived(todos)
  })
}
