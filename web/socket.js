let socket

//OTODO: handling socket disconnects

export function startSocket(onTodosReceived) {

  // Create WebSocket connection.
  socket = new WebSocket('ws://localhost:8000')

  // Connection opened
  socket.addEventListener('open', function (_) {
    // socket.send('Hello Server!')
    console.log('socket connection is open')
  })

  // Listen for messages
  socket.addEventListener('message', function (event) {
    const todos = JSON.parse(event.data)
    onTodosReceived(todos)
  })

  socket.addEventListener('close', function (_) {
    console.log('socket connection is closed')
  })
}

export function sendTodoOpened(todo) {
  if (socket) {
    socket.send(JSON.stringify(todo))
  } else {
    console.log('could not send todo')
  }
}