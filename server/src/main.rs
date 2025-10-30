use {
    rocket::{
        State, delete,
        fs::{FileServer, NamedFile, TempFile},
        get, launch, put,
        response::status::NoContent,
        routes,
        serde::{Serialize, json::Json},
    },
    std::{
        collections::HashMap,
        path::{Path, PathBuf},
    },
};

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
struct FileList {
    files: Vec<String>,
}
struct Config {
    filetype_path: HashMap<String, PathBuf>,
}

impl Config {
    fn filetype_path(&self, filetype: &str) -> Option<&PathBuf> {
        self.filetype_path.get(filetype)
    }
}

#[get("/<filetype>")]
async fn list(state: &State<Config>, filetype: &str) -> Option<Json<FileList>> {
    state.filetype_path(filetype).map(|path| {
        let mut files = Vec::new();
        if let Ok(dir) = std::fs::read_dir(path) {
            for entry in dir {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if !path.is_dir()
                        && let Some(name) = path.file_name()
                        && let Some(name) = name.to_str()
                        && !name.starts_with(".")
                    {
                        files.push(name.to_owned());
                    }
                }
            }
        }
        let list = FileList { files };
        Json(list)
    })
}

#[get("/<filetype>/<name>")]
async fn download(state: &State<Config>, filetype: &str, name: PathBuf) -> Option<NamedFile> {
    let dir = state.filetype_path(filetype)?;
    NamedFile::open(dir.join(name)).await.ok()
}

#[delete("/<filetype>/<name>")]
async fn delete(state: &State<Config>, filetype: &str, name: PathBuf) -> NoContent {
    //do we care if there isn't a file at the path given?
    if let Some(path) = state.filetype_path(filetype) {
        let _ = std::fs::remove_file(path.join(name));
    }
    NoContent
}

#[put("/<filetype>/<name>", data = "<file>")]
async fn upload(
    state: &State<Config>,
    filetype: &str,
    name: &str,
    mut file: TempFile<'_>,
) -> Option<std::io::Result<()>> {
    let dir = state.filetype_path(filetype)?; //XXX will 404, is that okay?
    let p = Path::new(dir).join(name);
    Some(file.persist_to(p).await)
}

#[launch]
fn rocket() -> _ {
    let mut filetype_path = HashMap::new();

    //TODO
    filetype_path.insert(
        "datafiles".to_string(),
        PathBuf::from("/Users/xnor/Documents/rnbo/datafiles/"),
    );
    rocket::build()
        .mount("/", FileServer::from("../out"))
        .mount("/api", routes![list, download, upload, delete])
        .manage(Config { filetype_path })
}
