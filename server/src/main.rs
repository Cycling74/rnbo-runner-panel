use {
    crate::config::{Config, RunnerConfig},
    clap::Parser,
    rocket::{fs::FileServer, main},
    rocket_dyn_templates::Template,
    std::{
        collections::{HashMap, HashSet},
        path::PathBuf,
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

    let package_dir = runner_config.package_dir.clone();
    if let Some(path) = runner_config.package_dir {
        filetype_paths.insert("packages".to_string(), path.to_owned());
        deleteable_filetypes.insert("packages".to_string());
    }

    {
        rocket::build()
            .mount("/", FileServer::from("../out"))
            .mount("/files", crate::routes::file_routes())
            .mount("/packages", crate::routes::package_routes())
            .manage(Config::new(
                filetype_paths,
                deleteable_filetypes,
                package_dir,
            ))
            .attach(Template::fairing())
            .launch()
            .await?;
    }
    Ok(())
}
