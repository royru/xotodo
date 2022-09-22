// don't forget to keep in sync with rust struct
export interface Todo {
  title: string
  status: 'open' | 'closed'
  tsIndexed: string // naive date time string of format "YYYY-MM-DD HH:MM:SS"
  filePath: string
  lineNumber: number
  dueDate?: string // rust naive date of string format YYYY-MM-DD
  project: string
}
