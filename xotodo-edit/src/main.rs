use reqwasm::http::Request;
use serde::Deserialize;
use yew::prelude::*;

#[derive(Clone, PartialEq, Deserialize)]
struct File {
    line: usize,
    content: String,
}

#[derive(Properties, PartialEq)]
struct FileLinesProps {
    lines: Vec<String>,
}

#[function_component(FileLine)]
fn file_lines(FileLinesProps { lines }: &FileLinesProps) -> Html {
    lines
        .iter()
        .map(|line| {
            if line.contains("OTODO:") {
                return html! {
                  <span class="otodo">{format!("{}", line)}</span>
                };
            }
            html! {
              <span>{format!("{}", line)}</span>
            }
        })
        .collect()
}

#[function_component(App)]
fn app() -> Html {
    let file = use_state(|| File {
        content: "".to_string(),
        line: 1,
    });
    {
        let file = file.clone();
        use_effect_with_deps(
            move |_| {
                let file = file.clone();
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
                    file.set(fetched_file);
                });
                || ()
            },
            (),
        );
    };

    let file_strings: Vec<String> = file.content.lines().map(|l| l.to_string()).collect();

    html! {
        <>
          <a href="/">{"Back"}</a>
          <FileLine lines={file_strings.clone()}/>
        </>
    }
}

fn main() {
    yew::start_app::<App>();
}
