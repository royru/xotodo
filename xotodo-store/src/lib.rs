extern crate serde;
// extern crate sled;

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

// use std::io::Write;
// use sled::{Config, Result};
// let mut file = std::fs::File::create("foo.txt")?;
// file.write_all(b"buf")?;

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
    pub ts_indexed: u64,
    pub status: Status,
    #[serde(rename = "dueDate")]
    pub due_date: Option<u64>,
}

#[wasm_bindgen]
pub struct TodoStore {
    todos_map: HashMap<String, Vec<Todo>>,
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
        let todos: Vec<Todo> = match value.into_serde() {
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
