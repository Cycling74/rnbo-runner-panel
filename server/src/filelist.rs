use rocket::serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct FileListItem {
    pub name: String,
    pub uri: String,
    pub dir: bool,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct FileList {
    pub filetype: String,
    pub items: Vec<FileListItem>,
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
