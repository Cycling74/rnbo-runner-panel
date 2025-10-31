use {
    crate::filelist::{FileList, FileListItem},
    rocket::uri,
    serde::Deserialize,
    std::{
        collections::{HashMap, HashSet},
        fs::File,
        io::BufReader,
        path::PathBuf,
    },
};

pub struct Config {
    pub filetype_paths: HashMap<String, PathBuf>,
    pub deleteable_filetypes: HashSet<String>,
}

#[derive(Deserialize, Default)]
pub struct RunnerConfig {
    pub backup_dir: Option<PathBuf>,
    pub datafile_dir: Option<PathBuf>,
    pub compile_cache_dir: Option<PathBuf>,
    pub package_dir: Option<PathBuf>,
    pub source_cache_dir: Option<PathBuf>,

    pub export_dir: Option<PathBuf>,
    pub save_dir: Option<PathBuf>,

    //file path
    pub db_path: Option<PathBuf>,
}

impl RunnerConfig {
    pub fn read_or_default(config_path: &PathBuf) -> Self {
        if std::path::Path::exists(config_path) {
            if let Ok(file) = File::open(config_path) {
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
    pub fn new(
        filetype_paths: HashMap<String, PathBuf>,
        deleteable_filetypes: HashSet<String>,
    ) -> Self {
        Self {
            filetype_paths,
            deleteable_filetypes,
        }
    }
    pub fn filetypelist(&self) -> FileList {
        let mut items = Vec::new();
        for filetype in self.filetype_paths.keys() {
            items.push(FileListItem {
                name: filetype.clone(),
                uri: uri!("/files", crate::routes::list_json(filetype)).to_string(),
            });
        }
        FileList::new_sorted("filetypes", items)
    }

    pub fn filetype_path(&self, filetype: &str) -> Option<&PathBuf> {
        self.filetype_paths.get(filetype)
    }

    pub fn deleteable_filetype_path(&self, filetype: &str) -> Option<&PathBuf> {
        if self.deleteable_filetypes.contains(filetype) {
            self.filetype_paths.get(filetype)
        } else {
            None
        }
    }

    pub fn filelist(&self, filetype: &str) -> Option<FileList> {
        self.filetype_path(filetype).map(|path| {
            let mut items = Vec::new();
            if let Ok(dir) = std::fs::read_dir(path) {
                for entry in dir.flatten() {
                    let path = entry.path();
                    if !path.is_dir()
                        && let Some(name) = path.file_name()
                        && let Some(name) = name.to_str()
                        && !name.starts_with(".")
                    {
                        let item = FileListItem {
                            name: name.to_owned(),
                            uri: uri!("/files", crate::routes::download(filetype, name))
                                .to_string(),
                        };
                        items.push(item);
                    }
                }
            }
            FileList::new_sorted(filetype, items)
        })
    }
}
