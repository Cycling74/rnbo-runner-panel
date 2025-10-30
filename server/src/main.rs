use {
    rocket::{
        fs::{FileServer, NamedFile, TempFile},
        get, launch, put, routes,
        serde::{Serialize, json::Json},
    },
    std::path::{Path, PathBuf},
};

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
struct FileList {
    files: Vec<String>,
}

fn filetype_path(filetype: &str) -> Option<&Path> {
    match filetype {
        "datafiles" => Some(Path::new("/Users/xnor/Documents/rnbo/datafiles/")),
        _ => None,
    }
}

#[get("/<filetype>")]
async fn list(filetype: &str) -> Option<Json<FileList>> {
    filetype_path(filetype).map(|path| {
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
async fn download(filetype: &str, name: PathBuf) -> Option<NamedFile> {
    let dir = filetype_path(filetype)?;
    NamedFile::open(dir.join(name)).await.ok()
}

#[put("/<filetype>/<name>", data = "<file>")]
async fn upload(filetype: &str, name: &str, mut file: TempFile<'_>) -> Option<std::io::Result<()>> {
    let dir = filetype_path(filetype)?; //XXX will 404, is that okay?
    let p = Path::new(dir).join(name);
    Some(file.persist_to(p).await)
}

#[launch]
fn rocket() -> _ {
    //rocket::build()
    rocket::build()
        .mount("/", FileServer::from("../out"))
        .mount("/api", routes![list, download, upload])
}
