import { Todo } from "../file-parser.ts"
import { TodoDict } from "./api.ts"

const dueDateDiv = document.querySelector('#due-date')!
const noDueDateDiv = document.querySelector('#no-due-date')!


export function renderOpenTodos(todoDict: TodoDict) {
  dueDateDiv.innerHTML = ''

  const todos: [string, Todo][] = []

  for (const [filePath, todoList] of Object.entries(todoDict)) {
    todoList.forEach((todo) => {
      if (todo.status == 'open')
        todos.push([filePath, todo])
    })
  }

  const today = todos
    .filter(([_, todo]) => todo.dueDate && getDateStr(new Date(todo.dueDate)) === getDateStr(new Date()))

  const overdue = todos
    .filter(([_, todo]) => todo.dueDate && new Date(todo.dueDate) < new Date())
    .sort(([_, a], [__, b]) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const upcoming = todos.filter(([_, todo]) => todo.dueDate && new Date(todo.dueDate) > new Date())
  const noDueDates = todos
    .filter(([_, todo]) => !todo.dueDate)
    // sort by filepath
    .sort(([a, _], [b, _2]) => a.localeCompare(b))

  if (today.length > 0) {
    renderSection(today, dueDateDiv, "today")
  }

  if (overdue.length > 0) {
    renderSection(overdue, dueDateDiv, "overdue")
  }

  if (upcoming.length > 0) {
    renderSection(upcoming, dueDateDiv, "upcoming")
  }

  if (noDueDates.length > 0) {
    renderSection(noDueDates, noDueDateDiv, "")
  }
}


function renderSection(todos: [string, Todo][], wrapper: any, cls: string) {
  for (const [filePath, todo] of todos) {
    // let shortened = filePath.replace(/\/Users\/roy\//, '~/')
    // shortened = shortened.replace(/\/Volumes\/GoogleDrive\/My Drive\/|\/Volumes\/Google Drive\/My Drive\//, 'GD:')

    const url = new URL('edit', location.origin)
    url.search = new URLSearchParams({ path: filePath, line: todo.lineNumber.toString() }).toString()

    const pathNode = a(`${filePath}#${todo.lineNumber}`, url.toString(), 'edit', '_blank')

    if (todo.dueDate) {
      const dateStr = new Date(getDateStr(new Date(todo.dueDate)))
      const todayStr = new Date(getDateStr(new Date()))
      const daysOverdue = ((dateStr.getTime() - todayStr.getTime()) / (60 * 60 * 24 * 1000)).toString()
      wrapper.appendChild(div(span(todo.title, 'text'), pathNode, span(daysOverdue, "date " + cls)))

    } else {
      wrapper.appendChild(div(span(todo.title, 'text'), pathNode))
    }
  }
}

function div(...children: HTMLElement[]) {
  const n = document.createElement('div')
  for (const child of children) {
    n.appendChild(child)
  }
  return n
}

function span(text: string, className = '') {
  const n = document.createElement('span')
  n.textContent = text
  n.className = className
  return n
}

function a(text: string, link: string, className = '', target = '') {
  const n = document.createElement('a')
  n.textContent = text
  n.href = link
  n.className = className
  n.target = target
  return n
}

function h3(text: string) {
  const n = document.createElement('h3')
  n.textContent = text
  return n
}

function getDateStr(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}