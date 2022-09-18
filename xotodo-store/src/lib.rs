extern crate serde;
extern crate xotodo_parser_lib;

mod optional_naive_date_format;
mod utc_date_format;

use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use xotodo_parser_lib::{Status, Todo};

#[derive(Serialize, Deserialize)]
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

#[derive(Serialize, Deserialize)]
#[serde(remote = "Status")]
enum StatusDef {
    #[serde(rename = "open")]
    Open,
    #[serde(rename = "closed")]
    Closed,
}

#[derive(Serialize, Debug, Deserialize)]
struct TodoWrapper(#[serde(with = "TodoDef")] Todo);

#[wasm_bindgen]
pub struct TodoStore {
    todos_map: HashMap<String, Vec<TodoWrapper>>,
}

#[wasm_bindgen]
impl TodoStore {
    #[wasm_bindgen(constructor)]
    pub fn new() -> TodoStore {
        TodoStore {
            todos_map: HashMap::new(),
        }
    }

    pub fn set_item(&mut self, key: &str, value: &JsValue) -> Result<(), JsError> {
        let todos: Vec<TodoWrapper> = match value.into_serde() {
            Ok(todo) => todo,
            Err(err) => return Err(JsError::from(&err)),
        };

        self.todos_map.insert(key.to_string(), todos);
        Ok(())
    }

    pub fn remove_item(&mut self, key: &str) -> Result<(), JsError> {
        self.todos_map.remove(key);
        Ok(())
    }

    pub fn get_item(&self, key: &str) -> Result<JsValue, JsError> {
        let todo = self.todos_map.get(key);

        match JsValue::from_serde(&todo) {
            Ok(val) => return Ok(val),
            Err(err) => return Err(JsError::from(&err)),
        };
    }

    pub fn get_items(&self) -> Result<JsValue, JsError> {
        match JsValue::from_serde(&self.todos_map) {
            Ok(val) => return Ok(val),
            Err(err) => return Err(JsError::from(&err)),
        };
    }
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}
