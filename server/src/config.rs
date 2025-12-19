use {
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
    pub _package_dir: Option<PathBuf>,
}

#[derive(Deserialize, Default)]
pub struct RunnerConfig {
    pub backup_dir: Option<PathBuf>,
    pub datafile_dir: Option<PathBuf>,
    pub compile_cache_dir: Option<PathBuf>,
    pub package_dir: Option<PathBuf>,
    pub source_cache_dir: Option<PathBuf>,
    //pub save_dir: Option<PathBuf>,

    //file path
    //pub db_path: Option<PathBuf>,
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
        _package_dir: Option<PathBuf>,
    ) -> Self {
        Self {
            filetype_paths,
            deleteable_filetypes,
            _package_dir,
        }
    }

    /*
    pub fn package_dir(&self) -> &Option<PathBuf> {
        &self.package_dir
    }
    */

    pub fn filetypelist(&self) -> Vec<String> {
        self.filetype_paths.keys().map(|k| k.to_string()).collect()
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
}
