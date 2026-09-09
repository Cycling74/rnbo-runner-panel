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
            core::net::{IpAddr, Ipv4Addr, Ipv6Addr},
            rocket::{config::Config, error::ErrorKind},
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
            .merge((Config::TEMP_DIR, temp_dir));
        if let Some(dir) = args.template_dir {
            config = config.merge(("template_dir", dir));
        }
        let static_dir = args
            .static_dir
            .unwrap_or_else(|| PathBuf::from("../client/out"));

        let build_server = |address: IpAddr| {
            rocket::build()
                .configure(config.clone().merge((Config::ADDRESS, address)))
                .mount("/", FileServer::from(static_dir.clone()))
                .mount("/files", crate::routes::file_routes())
                .mount("/packages", crate::routes::package_routes())
                .manage(crate::config::Config::new(
                    filetype_paths.clone(),
                    deleteable_filetypes.clone(),
                    Some(runner_config.package_dir()),
                ))
                .attach(Template::fairing())
        };

        // Serve on the IPv6 wildcard so the panel is reachable over IPv6 as well as
        // IPv4. This matters for direct ethernet connections, where the only
        // addresses either end has are link-local ones and mDNS hands the browser
        // the AAAA record (http://<host>.local:3000).
        //
        // A `::` socket is dual-stack on the systems we ship to (Linux defaults to
        // net.ipv6.bindv6only = 0, as does macOS), so IPv4 clients keep working and
        // simply arrive as v4-mapped addresses. Rocket binds the socket itself and
        // doesn't expose IPV6_V6ONLY, so on a kernel booted with IPv6 disabled the
        // bind fails outright -- fall back to the IPv4 wildcard there rather than
        // refusing to start.
        if let Err(err) = build_server(IpAddr::V6(Ipv6Addr::UNSPECIFIED))
            .launch()
            .await
        {
            match err.kind() {
                ErrorKind::Bind(e) => {
                    eprintln!("failed to bind [::]:3000 ({e}), falling back to IPv4 only");
                    build_server(IpAddr::V4(Ipv4Addr::UNSPECIFIED))
                        .launch()
                        .await?;
                }
                _ => return Err(err),
            }
        }
    }
    Ok(())
}
