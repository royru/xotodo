use chrono::NaiveDate;
use serde::{self, Serializer};

const FORMAT: &'static str = "%Y-%m-%d";

pub fn serialize<S>(date: &Option<NaiveDate>, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let s = match date {
        Some(d) => format!("{}", d.format(FORMAT)),
        None => "".to_string(),
    };
    serializer.serialize_str(&s)
}
