use rocket::serde::Serialize;

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
