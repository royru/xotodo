const body = document.querySelector('body')

export function renderOpenTodos(todos) {
  console.log(todos)
  body.innerHTML = ''
  for (const [_, todoList] of todos) {
    for (const todo of todoList) {
      if (todo.status == 'open') {
        body.appendChild(div(span(todo.shortPath, 'context-path'), span(todo.title, 'text')))
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