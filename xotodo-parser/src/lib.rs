extern crate serde;
extern crate xotodo_parser_lib;

use chrono::{DateTime, NaiveDate, Utc};
use serde::Serialize;
use wasm_bindgen::prelude::*;
use xotodo_parser_lib::{parse_todo, Status, Todo};

mod optional_naive_date_format;
mod utc_date_format;

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

#[derive(Serialize)]
#[serde(remote = "Todo")]
#[serde(rename_all = "camelCase")]
struct TodoDef {
    title: String,
    line_number: u32,
    #[serde(with = "utc_date_format")]
    ts_indexed: DateTime<Utc>,
    #[serde(with = "StatusDef")]
    status: Status,
    #[serde(with = "optional_naive_date_format")]
    due_date: Option<NaiveDate>,
    project: String,
}

#[derive(Serialize)]
#[serde(remote = "Status")]
enum StatusDef {
    #[serde(rename = "open")]
    Open,
    #[serde(rename = "closed")]
    Closed,
}

#[derive(Serialize, Debug)]
struct TodoWrapper(#[serde(with = "TodoDef")] Todo);

#[wasm_bindgen]
pub fn parse(content: &str, file_path: &str) -> JsValue {
    let todos = parse_todo(content, file_path);
    match todos {
        Ok(todos) => todo_to_js_value(todos),
        Err(err) => {
            log(&format!("Error: {}", err));
            JsValue::from_str(&"[]")
        }
    }
}

fn todo_to_js_value(todos: Vec<Todo>) -> JsValue {
    let todos: Vec<TodoWrapper> = todos.into_iter().map(|todo| TodoWrapper(todo)).collect();
    JsValue::from_serde(&todos).unwrap()
}
