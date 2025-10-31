use {
    clap::Parser,
    rocket::{
        State, delete,
        fs::{FileServer, NamedFile, TempFile},
        get, main, put,
        response::status::NoContent,
        routes,
        serde::{Serialize, json::Json},
        uri,
    },
    rocket_dyn_templates::{Template, context},
    serde::Deserialize,
    std::{
        collections::{HashMap, HashSet},
        fs::File,
        io::BufReader,
        path::{Path, PathBuf},
    },
};

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
pub struct FileListItem {
    pub name: String,
    pub uri: String,
}

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
pub struct FileList {
    filetype: String,
    items: Vec<FileListItem>,
}

impl FileList {
    pub fn new_sorted<T: Into<String>>(filetype: T, mut items: Vec<FileListItem>) -> Self {
        items.sort_by_cached_key(|i| i.name.to_owned());
        Self {
            filetype: filetype.into(),
            items,
        }
    }
}
