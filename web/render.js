const body = document.querySelector('body')

export function renderTodos(todos) {
  console.log(todos)
  body.innerHTML = ''
  for (const [contextPath, todoList] of todos) {
    for (const todo of todoList) {
      body.appendChild(div(span(contextPath, 'context-path'), span(todo.title, 'text')))
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


// XTODO: sdf this is not 