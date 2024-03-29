import { Todo } from "../todo.ts"
import { completeTodo, incrementDueDate, openFile, TodoDict } from "./api.ts"

const dueDateDiv = document.querySelector('#due-date')!
const noDueDateDiv = document.querySelector('#no-due-date')!

export function renderOpenTodos(todoDict: TodoDict) {
  dueDateDiv.innerHTML = ''
  noDueDateDiv.innerHTML = ''

  const todos: [string, Todo][] = []

  for (const [filePath, todoList] of Object.entries(todoDict)) {
    todoList.forEach((todo) => {
      if (todo.status == 'open')
        todos.push([filePath, todo])
    })
  }

  const todayStr = getDateStr(new Date())

  const today = todos
    .filter(([_, todo]) => todo.dueDate && getDateStr(todo.dueDate) === todayStr)

  const overdue = todos
    .filter(([_, todo]) => todo.dueDate && getDateStr(todo.dueDate) < todayStr)
    .sort(([_, a], [__, b]) => new Date(b.dueDate!).getTime() - new Date(a.dueDate!).getTime())

  const upcoming = todos
    .filter(([_, todo]) => todo.dueDate && getDateStr(todo.dueDate) > todayStr)
    .sort(([_, a], [__, b]) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())

  const noDueDates = todos
    .filter(([_, todo]) => !todo.dueDate)
    // sort by filepath
    .sort(([a, _], [b, __]) => a.localeCompare(b))

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

function renderSection(todos: [string, Todo][], wrapper: Element, cls: string) {
  let lastProjectName = ''
  for (const [filePath, todo] of todos) {
    const url = new URL('edit', location.origin)
    url.search = new URLSearchParams({ path: filePath, line: todo.lineNumber.toString() }).toString()

    const pathNode = a(`${filePath}#${todo.lineNumber}`, url.toString(), 'edit', '_blank')
    const projectNode = span(`@${todo.project}`, 'project')
    const completeBtn = button('✓', () => { completeTodo(filePath, todo.lineNumber) }, "complete")
    const openBtn = button('open', () => { openFile(filePath) }, "open")

    if (todo.dueDate) {
      const dateStr = new Date(getDateStr(todo.dueDate))
      const todayStr = new Date(getDateStr(new Date()))
      const daysOverdue = ((dateStr.getTime() - todayStr.getTime()) / (60 * 60 * 24 * 1000)).toString()
      const dueDateNode = button(daysOverdue, () => { incrementDueDate(filePath, todo.lineNumber) }, "date " + cls)
      wrapper.appendChild(div(span(todo.title, 'text'), completeBtn, openBtn, projectNode, pathNode, dueDateNode))

    } else {
      if (todo.project != lastProjectName) {
        wrapper.appendChild(h3(`@${todo.project}`))
        lastProjectName = todo.project
      }
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

function button(text: string, cb: eventCbType, className?: string): HTMLButtonElement {
  const b = document.createElement("button")
  b.textContent = text
  if (className) { b.className = className }
  b.addEventListener("click", cb)
  return b
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

function getDateStr(date: Date | string) {
  const d = new Date(date)
  // leftpad
  const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1
  const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()
  return `${d.getFullYear()}-${month}-${day}`
}

interface eventCbType {
  (evt: MouseEvent): void
}