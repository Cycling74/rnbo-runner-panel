use {
    crate::{
        config::{Config, RunnerConfig},
        filelist::{FileList, FileListItem},
    },
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

mod config;
mod filelist;
mod routes;

#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// path to configuration json
    #[arg(short, long, default_value = "~/.config/rnbo/runner.json")]
    runner_config: String,
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

    {
        use crate::routes::*;
        rocket::build()
            .mount("/", FileServer::from("../out"))
            .mount(
                "/files",
                routes![filetypes, list_json, list_html, download, upload, delete],
            )
            .manage(Config {
                filetype_paths,
                deleteable_filetypes,
            })
            .attach(Template::fairing())
            .launch()
            .await?;
    }
    Ok(())
}
