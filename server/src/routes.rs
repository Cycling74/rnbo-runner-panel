use std::time::Duration;

const PACKAGE_TIMEOUT: Duration = Duration::from_millis(2_000);

mod file {
    use {
        crate::{
            config::Config,
            filelist::{FileList, FileListItem},
        },
        rocket::{
            Responder, State, delete,
            fs::{NamedFile, TempFile},
            get,
            http::{ContentType, Status},
            put,
            serde::json::Json,
            uri,
        },
        rocket_dyn_templates::{Template, context},
        serde::Deserialize,
        std::path::{Path, PathBuf},
    };

    #[derive(Responder)]
    pub enum FileGet {
        #[response(status = 200, content_type = "json")]
        JsonListing(Json<FileList>),
        #[response(status = 200, content_type = "html")]
        HtmlListing(Template),
        #[response(status = 200)]
        File(NamedFile),
        #[response(status = 200)]
        PackageFile((ContentType, NamedFile)),
    }

    async fn get_impl(
        state: &State<Config>,
        filetype: &str,
        subdirs: PathBuf,
        json: bool,
    ) -> Option<FileGet> {
        let dir = state.filetype_path(filetype)?;
        let fullpath = dir.join(&subdirs);
        if fullpath.is_dir() {
            let mut items = Vec::new();
            let entries = std::fs::read_dir(fullpath).ok()?;
            for entry in entries.flatten() {
                let path = entry.path();
                if let Some(name) = path.file_name()
                    && let Some(name) = name.to_str()
                    && !name.starts_with(".")
                {
                    let relative = subdirs.join(name);
                    let uri = if json {
                        uri!("/files", get_json(filetype, relative)).to_string()
                    } else {
                        uri!("/files", get_html(filetype, relative)).to_string()
                    };
                    let item = FileListItem {
                        name: name.to_owned(),
                        uri,
                        dir: path.is_dir(),
                    };
                    items.push(item);
                }
            }

            let list = FileList::new_sorted(filetype, items);
            Some(if json {
                FileGet::JsonListing(Json(list))
            } else {
                FileGet::HtmlListing(Template::render("filelist", context! { list }))
            })
        } else {
            NamedFile::open(fullpath).await.ok().map(|f| {
                //match extension
                let e = f.path().extension().map(|e| {
                    e.to_os_string()
                        .into_string()
                        .unwrap_or_else(|_| "".to_string())
                });
                match e {
                    Some(e) if e == "rnbopack" => FileGet::PackageFile((ContentType::TAR, f)),
                    _ => FileGet::File(f),
                }
            })
        }
    }

    #[get("/", format = "html")]
    pub async fn get_filetypes(state: &State<Config>) -> Template {
        let items = state
            .filetypelist()
            .iter()
            .map(|filetype| FileListItem {
                name: filetype.clone(),
                uri: uri!("/files", get_html(filetype, PathBuf::default())).to_string(),
                dir: true,
            })
            .collect();
        let list = FileList::new_sorted("filetypes", items);

        Template::render("filetypelist", context! { list })
    }

    #[get("/<filetype>/<subdirs..>", format = "html", rank = 1)]
    pub async fn get_html(
        state: &State<Config>,
        filetype: &str,
        subdirs: PathBuf,
    ) -> Option<FileGet> {
        get_impl(state, filetype, subdirs, false).await
    }

    #[get("/<filetype>/<subdirs..>", format = "json", rank = 2)]
    pub async fn get_json(
        state: &State<Config>,
        filetype: &str,
        subdirs: PathBuf,
    ) -> Option<FileGet> {
        get_impl(state, filetype, subdirs, true).await
    }

    #[delete("/<filetype>/<name..>")]
    pub async fn delete(
        state: &State<Config>,
        filetype: &str,
        name: PathBuf,
    ) -> Result<Status, Status> {
        let dir = state
            .deleteable_filetype_path(filetype)
            .ok_or(Status::Unauthorized)?;
        let path = dir.join(name);
        if path.is_dir() {
            if &path == dir {
                eprintln!("cannot delete top level filetype directories");
                return Err(Status::Forbidden);
            }
            tokio::fs::remove_dir_all(path)
                .await
                .map_err(|_| Status::NotFound)?;
        } else {
            tokio::fs::remove_file(path)
                .await
                .map_err(|_| Status::NotFound)?;
        }
        Ok(Status::NoContent)
    }

    //helper struct to get version string
    #[derive(Deserialize)]
    struct VersionBody {
        #[serde(rename = "VALUE")]
        value: String,
    }

    #[put("/<filetype>/<name..>", data = "<file>")]
    pub async fn upload(
        state: &State<Config>,
        filetype: &str,
        name: PathBuf,
        mut file: TempFile<'_>,
    ) -> Result<Status, Status> {
        let dir = state.filetype_path(filetype).ok_or(Status::BadRequest)?;

        let fullpath = if filetype == "packages" && name.starts_with("current/") {
            if name.components().count() != 2 {
                return Err(Status::BadRequest);
            }
            let body: VersionBody = reqwest::get("http://127.0.0.1:5678/rnbo/info/version?VALUE")
                .await
                .map_err(|_| Status::FailedDependency)?
                .json()
                .await
                .map_err(|_| Status::FailedDependency)?;
            let name = name.file_name().ok_or(Status::FailedDependency)?;
            //allow for /packages/current/filename.foo
            Path::new(dir).join(body.value).join(name)
        } else {
            Path::new(dir).join(name)
        };

        tokio::fs::create_dir_all(fullpath.parent().expect("to get parent path"))
            .await
            .map_err(|_| Status::FailedDependency)?;

        file.persist_to(fullpath)
            .await
            .map_err(|_| Status::InternalServerError)?;
        Ok(Status::Created)
    }
}

mod package {
    use {
        super::PACKAGE_TIMEOUT,
        rocket::{get, http::Status, response::Redirect, uri},
        serde::{Deserialize, Serialize},
        std::path::PathBuf,
        uuid::Uuid,
    };

    //packages
    #[derive(Serialize, Default, Clone)]
    struct PackageCreateConfig {
        //package details
        #[serde(skip_serializing_if = "Option::is_none")]
        rnbo_version: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        include_presets: Option<bool>,
        #[serde(skip_serializing_if = "Option::is_none")]
        include_views: Option<bool>,
        #[serde(skip_serializing_if = "Option::is_none")]
        include_datafiles: Option<bool>,
        #[serde(skip_serializing_if = "Option::is_none")]
        include_binaries: Option<bool>,
    }

    //packages
    #[derive(Serialize, Default)]
    struct PackageParams {
        #[serde(skip_serializing_if = "Option::is_none")]
        set: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        patcher: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        all: Option<bool>,

        #[serde(flatten)]
        config: PackageCreateConfig,
    }

    #[derive(Serialize)]
    struct PackageCmd {
        method: &'static str,
        id: Uuid,
        params: PackageParams,
    }

    impl PackageCmd {
        fn all(_config: PackageCreateConfig) -> Self {
            PackageCmd {
                method: "package_create",
                id: Uuid::new_v4(),
                params: PackageParams {
                    all: Some(true),
                    ..Default::default()
                },
            }
        }

        fn graph(name: &str, config: PackageCreateConfig) -> Self {
            PackageCmd {
                method: "package_create",
                id: Uuid::new_v4(),
                params: PackageParams {
                    set: Some(name.to_string()),
                    config,
                    ..Default::default()
                },
            }
        }

        fn patcher(name: &str, config: PackageCreateConfig) -> Self {
            PackageCmd {
                method: "package_create",
                id: Uuid::new_v4(),
                params: PackageParams {
                    patcher: Some(name.to_string()),
                    config,
                    ..Default::default()
                },
            }
        }
    }

    #[derive(Deserialize)]
    struct ErrorBody; //don't care
    //
    #[derive(Deserialize)]
    struct ResultBody {
        filename: String,
        progress: f32,
        //packagename: String,
        //don't care about the rest
    }

    #[derive(Deserialize)]
    struct PackageResponse {
        id: Uuid,
        error: Option<ErrorBody>,
        result: Option<ResultBody>,
    }

    async fn compute_and_redirect(cmd: PackageCmd) -> Result<Redirect, Status> {
        use {
            futures_util::{SinkExt, TryStreamExt},
            reqwest_websocket::{Message, RequestBuilderExt},
            rosc::{OscMessage, OscPacket, OscType},
        };
        if let Ok(res) = reqwest::Client::new()
            .get("http://127.0.0.1:5678")
            .upgrade()
            .send()
            .await
            && let Ok(mut ws) = res.into_websocket().await
        {
            let id = cmd.id;

            let cmd = serde_json::to_string(&cmd).unwrap();
            let packet = OscPacket::Message(OscMessage {
                addr: "/rnbo/cmd".to_string(),
                args: vec![OscType::String(cmd)],
            });

            //send cmd
            if let Ok(msg) = rosc::encoder::encode(&packet) {
                let _ = ws.send(Message::Binary(msg.into())).await;
                //wait for response, TIMEOUT!
                while let Some(message) =
                    ws.try_next().await.map_err(|_| Status::FailedDependency)?
                {
                    if let Message::Binary(vec) = message
                        && let Ok((_, OscPacket::Message(m))) =
                            rosc::decoder::decode_udp(vec.as_ref())
                        && m.addr == "/rnbo/resp"
                        && !m.args.is_empty()
                        && let OscType::String(resp) = &m.args[0]
                        && let Ok(resp) = serde_json::from_str::<PackageResponse>(resp.as_str())
                        && resp.id == id
                    {
                        if let Some(result) = resp.result
                            && result.progress >= 100.0
                        {
                            let path = PathBuf::from(result.filename);
                            return Ok(Redirect::to(uri!(
                                "/files",
                                super::file::get_html("packages", path)
                            )));
                        } else if let Some(_err) = resp.error {
                            eprintln!("error with package_create");
                            return Err(Status::NotFound);
                        }
                    }
                }
            }
            Err(Status::FailedDependency)
        } else {
            Err(Status::FailedDependency)
        }
    }

    async fn get_impl(
        packagetype: &str,
        name: Option<&str>,
        config: PackageCreateConfig,
    ) -> Result<Redirect, Status> {
        let cmd = match packagetype {
            "all" => PackageCmd::all(config),
            "graphs" if name.is_some() => PackageCmd::graph(name.unwrap(), config),
            "patchers" if name.is_some() => PackageCmd::patcher(name.unwrap(), config),
            _ => return Err(Status::NotFound),
        };

        tokio::time::timeout(PACKAGE_TIMEOUT, compute_and_redirect(cmd))
            .await
            .map_err(|_| Status::GatewayTimeout)?
    }

    #[get(
        "/<packagetype>/<name>?<rnbo_version>&<include_presets>&<include_views>&<include_binaries>&<include_datafiles>"
    )]
    pub async fn get(
        packagetype: &str,
        name: &str,
        rnbo_version: Option<&str>,
        include_presets: Option<bool>,
        include_views: Option<bool>,
        include_binaries: Option<bool>,
        include_datafiles: Option<bool>,
    ) -> Result<Redirect, Status> {
        let config = PackageCreateConfig {
            rnbo_version: rnbo_version.map(|s| s.to_string()),
            include_presets,
            include_views,
            include_binaries,
            include_datafiles,
        };
        return get_impl(packagetype, Some(name), config).await;
    }

    #[get(
        "/all?<rnbo_version>&<include_presets>&<include_views>&<include_binaries>&<include_datafiles>"
    )]
    pub async fn get_all(
        rnbo_version: Option<&str>,
        include_presets: Option<bool>,
        include_views: Option<bool>,
        include_binaries: Option<bool>,
        include_datafiles: Option<bool>,
    ) -> Result<Redirect, Status> {
        let config = PackageCreateConfig {
            rnbo_version: rnbo_version.map(|s| s.to_string()),
            include_presets,
            include_views,
            include_binaries,
            include_datafiles,
        };
        return get_impl("all", None, config).await;
    }
}

pub fn file_routes() -> Vec<rocket::Route> {
    rocket::routes![
        file::get_filetypes,
        file::get_html,
        file::get_json,
        file::upload,
        file::delete
    ]
}

pub fn package_routes() -> Vec<rocket::Route> {
    rocket::routes![package::get, package::get_all]
}

#[cfg(test)]
mod test {
    use {
        rocket::{
            http::{Accept, ContentType, Status},
            local::blocking::Client,
        },
        rocket_dyn_templates::Template,
        std::{
            collections::{HashMap, HashSet},
            fs,
        },
        tempdir::TempDir,
    };

    const CURRENT_RNBO_VERSION: &'static str = "1.2.3";

    struct Resources {
        tempdir: TempDir,
    }

    impl Resources {
        fn new() -> Self {
            Self {
                tempdir: TempDir::new("runner-panel").expect("to get temp dir"),
            }
        }
    }

    //minimal server
    fn setup() -> (Client, Resources) {
        use std::io::prelude::*;
        let resources = Resources::new();
        let mut filetype_paths = HashMap::new();
        let mut deleteable_filetypes = HashSet::new();

        let datafiles = resources.tempdir.path().join("datafiles");
        let source_cache = resources.tempdir.path().join("source_cache");
        let package_dir = resources.tempdir.path().join("packages");
        let current_package_dir = package_dir.join(CURRENT_RNBO_VERSION);

        let backup = resources.tempdir.path().join("backup");

        fs::create_dir_all(&datafiles).expect("to create dir");
        fs::create_dir_all(&source_cache).expect("to create dir");
        fs::create_dir_all(&package_dir).expect("to create dir");
        fs::create_dir_all(&current_package_dir).expect("to create dir");
        fs::create_dir_all(&backup).expect("to create dir");

        filetype_paths.insert("datafiles".to_owned(), datafiles.clone());
        filetype_paths.insert("source_cache".to_owned(), source_cache);
        filetype_paths.insert("backup".to_owned(), backup.clone());
        filetype_paths.insert("packages".to_owned(), package_dir.clone());

        deleteable_filetypes.insert("datafiles".to_owned());
        deleteable_filetypes.insert("packages".to_owned());

        let f = datafiles.join("deleteme.txt");
        let mut file = fs::File::create(&f).expect("to create");
        file.write_all(b"Delete the world!").expect("to write");

        let f = datafiles.join("second.txt");
        let mut file = fs::File::create(&f).expect("to create");
        file.write_all(b"Fourth World Vol. 1 Possible Musics")
            .expect("to write");

        let f = backup.join("nodelete.txt");
        let mut file = fs::File::create(&f).expect("to create");
        file.write_all(b"Cannot delete world!").expect("to write");

        let f = current_package_dir.join("foo.rnbopack");
        let mut file = fs::File::create(&f).expect("to create");
        file.write_all(b"not really a tar file").expect("to write");

        (
            Client::tracked(
                rocket::build()
                    .mount("/files", super::file_routes())
                    .mount("/packages", super::package_routes())
                    .manage(crate::config::Config::new(
                        filetype_paths,
                        deleteable_filetypes,
                        Some(package_dir),
                    ))
                    .attach(Template::fairing()),
            )
            .expect("valid rocket instance"),
            resources,
        )
    }

    #[test]
    fn filetype_list() {
        let (client, _resources) = setup();

        let response = client.get("/files/").header(Accept::HTML).dispatch();
        assert_eq!(response.status(), Status::Ok);
        assert_eq!(response.content_type(), Some(ContentType::HTML));
    }

    #[test]
    fn filetype_unknown() {
        let (client, _resources) = setup();
        let response = client.get("/files/foo/").header(Accept::JSON).dispatch();
        assert_eq!(response.status(), Status::NotFound);

        let response = client.get("/files/foo/").header(Accept::HTML).dispatch();
        assert_eq!(response.status(), Status::NotFound);
    }

    #[test]
    fn filetype_known() {
        let (client, _resources) = setup();

        let response = client
            .get("/files/datafiles/")
            .header(Accept::JSON)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        assert_eq!(response.content_type(), Some(ContentType::JSON));

        let list: Option<crate::filelist::FileList> = response.into_json();
        assert!(list.is_some());

        let list = list.unwrap();

        assert_eq!(list.items.len(), 2);
        assert_eq!(list.filetype.as_str(), "datafiles");
        assert!(
            list.items
                .iter()
                .find(|f| f.name.as_str() == "deleteme.txt")
                .is_some()
        );
        assert!(
            list.items
                .iter()
                .find(|f| f.name.as_str() == "second.txt")
                .is_some()
        );

        let response = client
            .get("/files/datafiles/")
            .header(Accept::HTML)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        assert_eq!(response.content_type(), Some(ContentType::HTML));

        let response = client.get("/files/datafiles/second.txt").dispatch();
        assert_eq!(response.status(), Status::Ok);
        assert_eq!(
            response.into_string().unwrap().as_str(),
            "Fourth World Vol. 1 Possible Musics"
        );

        let response = client
            .get(format!(
                "/files/packages/{}/foo.rnbopack",
                CURRENT_RNBO_VERSION
            ))
            .header(Accept::HTML)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        assert_eq!(response.content_type(), Some(ContentType::TAR));
    }

    #[test]
    fn delete() {
        let (client, resources) = setup();

        let p = resources.tempdir.path().join("datafiles/deleteme.txt");
        assert_eq!(Some(true), fs::exists(&p).ok());
        let response = client.delete("/files/datafiles/deleteme.txt").dispatch();
        assert_eq!(response.status(), Status::NoContent);
        assert_eq!(Some(false), fs::exists(&p).ok());

        let response = client
            .get("/files/datafiles/")
            .header(Accept::JSON)
            .dispatch();
        assert_eq!(response.status(), Status::Ok);
        assert_eq!(response.content_type(), Some(ContentType::JSON));

        let list: Option<crate::filelist::FileList> = response.into_json();
        assert!(list.is_some());

        let list = list.unwrap();

        assert_eq!(list.items.len(), 1);
        assert_eq!(list.filetype.as_str(), "datafiles");
        assert!(
            list.items
                .iter()
                .find(|f| f.name.as_str() == "deleteme.txt")
                .is_none()
        );
        assert!(
            list.items
                .iter()
                .find(|f| f.name.as_str() == "second.txt")
                .is_some()
        );

        let p = resources.tempdir.path().join("backup/nodelete.txt");
        assert_eq!(Some(true), fs::exists(&p).ok());
        let response = client.delete("/files/backup/nodelete.txt").dispatch();
        assert_eq!(response.status(), Status::Unauthorized);
        assert_eq!(Some(true), fs::exists(&p).ok());
    }

    #[test]
    fn put() {
        let (client, resources) = setup();

        let p = resources.tempdir.path().join("datafiles/blah.txt");
        assert_eq!(Some(false), fs::exists(&p).ok());

        let response = client
            .put("/files/datafiles/blah.txt")
            .body("FOO")
            .dispatch();

        assert_eq!(response.status(), Status::Created);
        assert_eq!(Some(true), fs::exists(&p).ok());
        let contents = fs::read_to_string(&p).expect("Should have been able to read the file");
        assert_eq!("FOO", contents.as_str());

        let response = client.put("/files/NOEXIST/blah.txt").body("FOO").dispatch();

        assert_eq!(response.status(), Status::BadRequest);
    }
}
