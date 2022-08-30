extern crate serde;
extern crate xotodo_parser_lib;

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use xotodo_parser_lib::parse_todo;

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
    let todos = parse_todo(content);
    to_serializable_todos()
}

fn to_serializable_todos(&todos: Vec<Todo>) -> JsValue {
    for todo in todos {
        // OTODO: replace NaiveDate with f64 ts
    }

    JsValue::from_serde(&todos).unwrap()
}
