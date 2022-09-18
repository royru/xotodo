use chrono::NaiveDate;
use serde::{self, Deserialize, Deserializer, Serializer};

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

pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<NaiveDate>, D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer);
    match s {
        Ok(s) => {
            if s == "" {
                return Ok(None);
            }
            NaiveDate::parse_from_str(&s, FORMAT)
                .map(|d| Some(d))
                .map_err(serde::de::Error::custom)
        }
        Err(_) => Ok(None),
    }
}
