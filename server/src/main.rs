use {
    crate::config::RunnerConfig,
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

    #[arg(short, long, default_value = None)]
    template_dir: Option<PathBuf>,

    #[arg(short, long, default_value = None)]
    static_dir: Option<PathBuf>,
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
    let filetype_paths = HashMap::from([
        ("datafiles".to_string(), runner_config.datafile_dir()),
        ("backup".to_string(), runner_config.backup_dir()),
        (
            "compile_cache".to_string(),
            runner_config.compile_cache_dir(),
        ),
        ("source_cache".to_string(), runner_config.source_cache_dir()),
        ("packages".to_string(), runner_config.package_dir()),
    ]);

    let deleteable_filetypes = HashSet::from(["packages".to_string(), "datafiles".to_string()]);

    {
        use {
            core::net::{IpAddr, Ipv4Addr},
            rocket::config::Config,
        };

        let temp_dir = runner_config.temp_dir();
        if runner_config.temp_dir_is_default() {
            // best-effort: ignore errors (e.g. dir doesn't exist yet).
            // Rocket's TempFile cleans up after each successful upload, but a
            // crash/power-loss mid-upload can orphan spool files. Since the default
            // location is used exclusively by us and no upload is in flight at
            // startup, it's safe to wipe. Custom dirs are never touched.
            let _ = std::fs::remove_dir_all(&temp_dir);
        }
        std::fs::create_dir_all(&temp_dir).expect("to create upload temp dir");

        let mut config = Config::figment()
            .merge((Config::PORT, 3000))
            .merge((Config::ADDRESS, IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0))))
            .merge((Config::TEMP_DIR, temp_dir));
        if let Some(dir) = args.template_dir {
            config = config.merge(("template_dir", dir));
        }
        let static_dir = args
            .static_dir
            .unwrap_or_else(|| PathBuf::from("../client/out"));

        rocket::build()
            .configure(config)
            .mount("/", FileServer::from(static_dir))
            .mount("/files", crate::routes::file_routes())
            .mount("/packages", crate::routes::package_routes())
            .manage(crate::config::Config::new(
                filetype_paths,
                deleteable_filetypes,
                Some(runner_config.package_dir()),
            ))
            .attach(Template::fairing())
            .launch()
            .await?;
    }
    Ok(())
}
