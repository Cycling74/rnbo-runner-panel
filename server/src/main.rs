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
struct FileListItem {
    name: String,
    uri: String,
}

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
struct FileList {
    filetype: String,
    items: Vec<FileListItem>,
}

impl FileList {
    fn new_sorted<T: Into<String>>(filetype: T, mut items: Vec<FileListItem>) -> Self {
        items.sort_by_cached_key(|i| i.name.to_owned());
        Self {
            filetype: filetype.into(),
            items,
        }
    }
}

struct Config {
    filetype_paths: HashMap<String, PathBuf>,
    deleteable_filetypes: HashSet<String>,
}

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// path to configuration json
    #[arg(short, long, default_value = "~/.config/rnbo/runner.json")]
    runner_config: String,
}

#[derive(Deserialize, Default)]
struct RunnerConfig {
    backup_dir: Option<PathBuf>,
    datafile_dir: Option<PathBuf>,
    compile_cache_dir: Option<PathBuf>,
    package_dir: Option<PathBuf>,
    source_cache_dir: Option<PathBuf>,

    export_dir: Option<PathBuf>,
    save_dir: Option<PathBuf>,

    //file path
    db_path: Option<PathBuf>,
}

impl RunnerConfig {
    pub fn read_or_default(config_path: &PathBuf) -> Self {
        if std::path::Path::exists(&config_path) {
            if let Ok(file) = File::open(&config_path) {
                let reader = BufReader::new(file);
                serde_json::from_reader(reader).unwrap_or_default()
            } else {
                Self::default()
            }
        } else {
            Self::default()
        }
    }
}

impl Config {
    fn filetypelist(&self) -> FileList {
        let mut items = Vec::new();
        for filetype in self.filetype_paths.keys() {
            items.push(FileListItem {
                name: filetype.clone(),
                uri: uri!("/files", list_json(filetype)).to_string(),
            });
        }
        FileList::new_sorted("filetypes", items)
    }

    fn filetype_path(&self, filetype: &str) -> Option<&PathBuf> {
        self.filetype_paths.get(filetype)
    }

    fn deleteable_filetype_path(&self, filetype: &str) -> Option<&PathBuf> {
        if self.deleteable_filetypes.contains(filetype) {
            self.filetype_paths.get(filetype)
        } else {
            None
        }
    }

    fn filelist(&self, filetype: &str) -> Option<FileList> {
        self.filetype_path(filetype).map(|path| {
            let mut items = Vec::new();
            if let Ok(dir) = std::fs::read_dir(path) {
                for entry in dir {
                    if let Ok(entry) = entry {
                        let path = entry.path();
                        if !path.is_dir()
                            && let Some(name) = path.file_name()
                            && let Some(name) = name.to_str()
                            && !name.starts_with(".")
                        {
                            let item = FileListItem {
                                name: name.to_owned(),
                                uri: uri!("/files", download(filetype, name)).to_string(),
                            };
                            items.push(item);
                        }
                    }
                }
            }
            FileList::new_sorted(filetype, items)
        })
    }
}

#[get("/", format = "html")]
async fn filelist(state: &State<Config>) -> Template {
    let list = state.filetypelist();
    Template::render("filetypelist", context! { list })
}

#[get("/<filetype>", format = "html", rank = 1)]
async fn list_html(state: &State<Config>, filetype: &str) -> Option<Template> {
    state
        .filelist(filetype)
        .map(|list| Template::render("filelist", context! { list }))
}

#[get("/<filetype>", format = "json", rank = 2)]
async fn list_json(state: &State<Config>, filetype: &str) -> Option<Json<FileList>> {
    state.filelist(filetype).map(|list| Json(list))
}

#[get("/<filetype>/<name>")]
async fn download(state: &State<Config>, filetype: &str, name: PathBuf) -> Option<NamedFile> {
    let dir = state.filetype_path(filetype)?;
    NamedFile::open(dir.join(name)).await.ok()
}

#[delete("/<filetype>/<name>")]
async fn delete(state: &State<Config>, filetype: &str, name: PathBuf) -> NoContent {
    //do we care if there isn't a file at the path given?
    if let Some(path) = state.deleteable_filetype_path(filetype) {
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

#[main]
async fn main() -> Result<(), rocket::Error> {
    let args = Args::parse();

    let config_path = args.runner_config;
    let config_path = if let Some(config_path) = config_path.strip_prefix("~/") {
        let homedir = home::home_dir().expect("to get home directory");
        let mut p = homedir.clone();
        p.push(config_path);
        p
    } else {
        PathBuf::from(config_path)
    };

    let runner_config = RunnerConfig::read_or_default(&config_path);
    let mut filetype_paths = HashMap::new();
    let mut deleteable_filetypes = HashSet::new();

    if let Some(path) = runner_config.datafile_dir {
        filetype_paths.insert("datafiles".to_string(), path.to_owned());
        deleteable_filetypes.insert("datafiles".to_string());
    }

    if let Some(path) = runner_config.backup_dir {
        filetype_paths.insert("backup".to_string(), path.to_owned());
    }

    if let Some(path) = runner_config.compile_cache_dir {
        filetype_paths.insert("compile_cache".to_string(), path.to_owned());
    }

    if let Some(path) = runner_config.source_cache_dir {
        filetype_paths.insert("source_cache".to_string(), path.to_owned());
    }

    if let Some(path) = runner_config.package_dir {
        filetype_paths.insert("packages".to_string(), path.to_owned());
    }

    rocket::build()
        .mount("/", FileServer::from("../out"))
        .mount(
            "/files",
            routes![filelist, list_json, list_html, download, upload, delete],
        )
        .manage(Config {
            filetype_paths,
            deleteable_filetypes,
        })
        .attach(Template::fairing())
        .launch()
        .await?;
    Ok(())
}
