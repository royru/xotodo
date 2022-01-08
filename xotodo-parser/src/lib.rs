extern crate lazy_static;
extern crate regex;
extern crate serde;

use lazy_static::lazy_static;
use regex::Regex;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub enum Status {
    #[serde(rename = "open")]
    Open,
    #[serde(rename = "closed")]
    Closed,
}

#[derive(Serialize, Deserialize)]
pub struct Todo {
    pub title: String,
    #[serde(rename = "lineNumber")]
    pub line_number: u32,
    #[serde(rename = "tsIndexed")]
    pub ts_indexed: f64,
    pub status: Status,
    #[serde(rename = "dueDate")]
    pub due_date: Option<f64>,
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
    type Date;

    #[wasm_bindgen(static_method_of = Date)]
    pub fn now() -> f64;
    #[wasm_bindgen(static_method_of = Date)]
    pub fn parse(s: &str) -> Option<f64>;
}

#[wasm_bindgen]
pub fn parse(content: &str) -> JsValue {
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
            let mut due_date: Option<f64> = None;
            let status = if &cap[1] == "OTODO: " {
                Status::Open
            } else {
                Status::Closed
            };

            for due_cap in RE_DUE.captures_iter(&cap[2]) {
                title = title.replace(&due_cap[0], "");
                due_date = Date::parse(&due_cap[2]);
            }

            let todo = Todo {
                title,
                status,
                line_number: (i + 1) as u32,
                ts_indexed: Date::now(),
                due_date,
            };
            todos.push(todo)
        }
    }

    JsValue::from_serde(&todos).unwrap()
}
