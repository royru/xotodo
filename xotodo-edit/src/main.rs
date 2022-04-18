use reqwasm::http::Request;
use serde::Deserialize;
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
}

#[derive(Clone, PartialEq)]
struct Line {
    index: usize,
    content: String,
}

#[derive(Properties, PartialEq)]
struct FileLinesProps {
    lines: Vec<Line>,
    on_click: Callback<Line>,
}

#[derive(Clone, PartialEq)]
struct FileLinesTuple(File, Vec<Line>);

#[function_component(FileLines)]
fn file_lines(FileLinesProps { lines, on_click }: &FileLinesProps) -> Html {
    let on_click = on_click.clone();
    lines
        .iter()
        .map(|line| {
            log(&line.content);
            if line.content.contains("OTODO:") {
                let on_todo_select = {
                    let on_click = on_click.clone();
                    let line = line.clone();
                    Callback::from(move |_| on_click.emit(line.clone()))
                };
                return html! {
                  <span onclick={on_todo_select} class="otodo">{format!("{}", line.content)}</span>
                };
            }
            html! {
              <span>{format!("{}", line.content)}</span>
            }
        })
        .collect()
}

fn load_data() -> UseStateHandle<Option<FileLinesTuple>> {
    let data: UseStateHandle<Option<FileLinesTuple>> = use_state(|| None);
    {
        let data = data.clone();
        use_effect_with_deps(
            move |_| {
                let data = data.clone();
                wasm_bindgen_futures::spawn_local(async move {
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
                        .map(|(i, l)| Line {
                            content: l.to_string(),
                            index: i,
                        })
                        .collect();

                    data.set(Some(FileLinesTuple(fetched_file, lines)));
                });
                || ()
            },
            (),
        );
    };

    data
}

#[function_component(App)]
fn app() -> Html {
    let data = load_data();
    let default = html! {
      <>
        <a href="/">{"Back"}</a>
      </>
    };

    let on_todo_select = {
        let data = data.clone();
        match data.as_ref() {
            Some(data_ref) => {
                let file = data_ref.0.clone();
                let lines = data_ref.1.clone();
                Callback::from(move |line: Line| {
                    let mut lines = lines.clone();
                    let file = file.clone();
                    lines[line.index] = Line {
                        index: line.index,
                        content: "test".to_string(),
                    };
                    data.set(Some(FileLinesTuple(file, lines)));
                })
            }
            _ => {
                return default;
            }
        }
    };

    if let Some(data) = data.as_ref() {
        let lines = data.1.clone();
        return html! {
          <>
            <a href="/">{"Back"}</a>
            <FileLines lines={lines.clone()} on_click={on_todo_select.clone()}/>
          </>
        };
    }

    default
}

fn main() {
    yew::start_app::<App>();
}
