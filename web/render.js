import { sendTodoOpened } from './socket.js'
const body = document.querySelector('body')

export function renderOpenTodos(todos) {
  console.log(todos)
  body.innerHTML = ''
  for (const [filePath, todoList] of todos) {
    let shortened = filePath.replace(/\/Users\/roy\//, '~/')
    shortened = shortened.replace(/\/Volumes\/GoogleDrive\/My Drive\/|\/Volumes\/Google Drive\/My Drive\//, 'GD:')
    body.appendChild(h3(shortened))
    for (const todo of todoList) {
      if (todo.status == 'open') {
        const pathNode = span(`@${todo.lineNumber}`, 'line-number')
        pathNode.addEventListener('click', () => sendTodoOpened(todo))

        // due date
        let cls = "due-soon"
        if (getDateStr(new Date(todo.dueDate)) == getDateStr(new Date())) {
          cls = "due-today"
        } else if (new Date(todo.dueDate) < new Date()) {
          cls = "overdue"
        }
        const dateStr = todo.dueDate ? new Date(todo.dueDate).toDateString() : ''
        body.appendChild(div(pathNode, span(todo.title, 'text'), span(dateStr, cls)))
      }
    }
  }
}

function div(...children) {
  const n = document.createElement('div')
  for (const child of children) {
    n.appendChild(child)
  }
  return n
}

function span(text, className = '') {
  const n = document.createElement('span')
  n.textContent = text
  n.className = className
  return n
}

function h3(text) {
  const n = document.createElement('h3')
  n.textContent = text
  return n
}

function getDateStr(d) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}