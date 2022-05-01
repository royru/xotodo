use reqwasm::http::Request;
use serde::Deserialize;
use urlencoding::encode;
use wasm_bindgen::prelude::*;
use yew::{prelude::*, UseStateHandle};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Clone, PartialEq, Deserialize)]
struct File {
    selected_line: usize,
    content: String,
    file_path: String,
}

#[derive(Clone, PartialEq)]
struct NormalLine {
    index: usize,
    content: String,
}

#[derive(Clone, PartialEq)]
struct TodoLine {
    index: usize,
    content: String,
    status: TodoStatus,
    date: i32,
}
#[derive(Clone, PartialEq)]
enum TodoStatus {
    Open,
    Completed,
}

#[derive(Clone, PartialEq)]
enum Line {
    Normal(NormalLine),
    Todo(TodoLine),
}

#[derive(Clone, PartialEq)]
struct FileLinesTuple(File, Vec<Line>);

#[derive(Properties, PartialEq)]
struct NormalLineProps {
    line: NormalLine,
}

#[derive(Properties, PartialEq)]
struct TodoLineProps {
    line: TodoLine,
    on_click: Callback<TodoLine>,
}

#[function_component(TodoLineElem)]
fn todo_line_elem(TodoLineProps { line, on_click }: &TodoLineProps) -> Html {
    let on_click = on_click.clone();
    let on_todo_select = {
        let on_click = on_click.clone();
        let l = line.clone();
        Callback::from(move |_| on_click.emit(l.clone()))
    };
    html! {
      <p onclick={on_todo_select} class="otodo">
        <span class="line-number">{line.index}</span>
        <pre class="line-content">{format!("{}", line.content)}</pre>
      </p>
    }
}

#[function_component(NormalLineElem)]
fn normal_line_elem(NormalLineProps { line }: &NormalLineProps) -> Html {
    html! {
      <p>
        <span class="line-number">{line.index}</span>
        <pre class="line-content">{format!("{}", line.content)}</pre>
      </p>
    }
}

fn load_data() -> UseStateHandle<Option<FileLinesTuple>> {
    let data: UseStateHandle<Option<FileLinesTuple>> = use_state(|| None);
    {
        let data = data.clone();
        use_effect_with_deps(
            move |_| {
                let data = data.clone();
                wasm_bindgen_futures::spawn_local(async move {
                    let res = load_data_future().await;
                    data.set(Some(res));
                });
                || ()
            },
            (),
        );
    };

    data
}

async fn load_data_future() -> FileLinesTuple {
    let window = web_sys::window().unwrap();
    let loc = window.location();
    let search = loc.search().unwrap();
    let mut url = String::from("/api/file");
    url.push_str(&search);
    let fetched_file: File = Request::get(url.as_str())
        .send()
        .await
        .unwrap()
        .json()
        .await
        .unwrap();

    let lines: Vec<Line> = fetched_file
        .content
        .lines()
        .enumerate()
        .map(|(i, l)| {
            if l.contains("OTODO:") {
                return Line::Todo(TodoLine {
                    content: l.to_string(),
                    index: i,
                    status: TodoStatus::Open,
                    date: 0,
                });
            } else {
                return Line::Normal(NormalLine {
                    content: l.to_string(),
                    index: i,
                });
            }
        })
        .collect();

    FileLinesTuple(fetched_file, lines)
}

async fn set_todo_completed(line_number: usize, file_path: String) {
    let path = encode(&file_path);
    let url = String::from(format!(
        "/api/complete?path={}&line={}",
        path,
        line_number.to_string()
    ));

    Box::new(Request::post(url.as_str())).send().await.unwrap();
}

#[function_component(App)]
fn app() -> Html {
    let data = load_data();
    let default = html! {
      <>
        <p>{"Not loaded"}</p>
      </>
    };

    let on_todo_select = {
        let data = data.clone();
        match data.as_ref() {
            Some(data_ref) => {
                let file = data_ref.0.clone();
                let data = data.clone();
                Callback::from(move |line: TodoLine| {
                    let file_path = file.file_path.clone();
                    let future = set_todo_completed(line.index, file_path);
                    let data = data.clone();
                    wasm_bindgen_futures::spawn_local(async move {
                        future.await;
                        let res = load_data_future().await;
                        data.set(Some(res));
                    });
                })
            }
            _ => {
                return default;
            }
        }
    };

    if let Some(data) = data.as_ref() {
        let lines = data.1.clone();

        let elems: Vec<Html> = lines
            .iter()
            .map(|line: &Line| match line {
                Line::Normal(l) => {
                    return html! {<NormalLineElem line={l.clone()} />};
                }
                Line::Todo(l) => {
                    return html! {<TodoLineElem line={l.clone()} on_click={on_todo_select.clone()} />};
                }
            })
            .collect();

        return html! {
          <>
            { for elems }
          </>
        };
    }

    default
}

fn main() {
    yew::start_app::<App>();
}
