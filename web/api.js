export function startPolling(onTodosReceived) {
  getData() // initial call
  setInterval(getData, 3000)

  async function getData() {
    const res = await fetch('/api/todos')
    const todos = await res.json()
    onTodosReceived(todos)
  }
}