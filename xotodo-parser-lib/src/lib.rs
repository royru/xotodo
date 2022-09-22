extern crate lazy_static;
extern crate regex;

use chrono::format::ParseError;
use chrono::{DateTime, NaiveDate, Utc};
use lazy_static::lazy_static;
use regex::Regex;

#[derive(Debug)]
pub enum Status {
    Open,
    Closed,
}

#[derive(Debug)]
pub struct Todo {
    pub title: String,
    pub line_number: u32,
    pub ts_indexed: DateTime<Utc>,
    pub status: Status,
    pub due_date: Option<NaiveDate>,
    pub project: String,
    pub file_path: String,
}

pub fn parse_todo(content: &str, file_path: &str) -> Result<Vec<Todo>, ParseError> {
    let split = content.split("\n");
    let lines: Vec<&str> = split.collect();

    lazy_static! {
        static ref RE: Regex = Regex::new(r"([XO]TODO:\s)(.+)").unwrap();
        static ref RE_DUE: Regex = Regex::new(r"(\s?@due:\s?)(\d{4}-\d{2}-\d{2})\s?").unwrap();
    }

    let mut todos: Vec<Todo> = vec![];

    for (i, line) in lines.iter().enumerate() {
        for cap in RE.captures_iter(line) {
            let mut title = (&cap[2]).to_string();
            let mut due_date: Option<NaiveDate> = None;
            let status = if &cap[1] == "OTODO: " {
                Status::Open
            } else {
                Status::Closed
            };

            for due_cap in RE_DUE.captures_iter(&cap[2]) {
                title = title.replace(&due_cap[0], "");
                let d = NaiveDate::parse_from_str(&due_cap[2], "%Y-%m-%d");
                due_date = match d {
                    Ok(d) => Some(d),
                    Err(e) => return Err(e),
                };
            }

            let todo = Todo {
                title,
                status,
                line_number: (i + 1) as u32,
                ts_indexed: Utc::now(),
                due_date,
                file_path: file_path.to_string(),
                project: "".to_string(),
            };
            todos.push(todo)
        }
    }
    Ok(todos)
}

// OTODO: currently not feasible with wasm-bindgen
// fn parse_project(file_path: &str) -> String {
//     let path = Path::new(file_path);
//     let first_parent = path.parent().unwrap();
//     let mut cur_parent = first_parent;
//     loop {
//         let parent_str = cur_parent.to_str().unwrap();
//         let mut git_dir = parent_str.to_string();
//         git_dir.push_str("/.git");
//         if Path::new(&git_dir).exists() {
//             // we found a .git repo
//             let parts: Vec<&str> = parent_str.split("/").collect();
//             return parts[parts.len() - 1].to_string();
//         }

//         match cur_parent.parent() {
//             None => {
//                 // no more parents, so current file is not part of a git repo.
//                 // project name defaults to the parent folder
//                 let parts: Vec<&str> = first_parent.to_str().unwrap().split("/").collect();
//                 return parts[parts.len() - 1].to_string();
//             }
//             Some(p) => cur_parent = p,
//         }
//     }
// }

#[cfg(test)]
mod tests {
    use crate::parse_todo;

    // #[test]
    // fn project() {
    //     let dir = env::current_dir().unwrap();
    //     let project = parse_project(dir.to_str().unwrap());
    //     println!("{}", project);
    //     assert_eq!(project, "xotodo")
    // }

    #[test]
    fn valid_todos() {
        let test = "
        OTODO: this is a test
        OTODO: this is another test @due:2022-02-03";

        let todos = parse_todo(test, "").unwrap();
        println!("{:?}", todos);
        assert_eq!(todos[0].title, "this is a test");
        assert_eq!(todos[1].title, "this is another test");
    }

    #[test]
    fn invalid_due_date() {
        let test = "OTODO: here, the due date is ignored due to bad formatting @due:02-02";
        let todos = parse_todo(test, "");
        println!("{:?}", todos);
        match todos {
            Ok(t) => assert_eq!(t[0].due_date, None),
            Err(_) => panic!("error should be ignored"),
        }
    }
}
