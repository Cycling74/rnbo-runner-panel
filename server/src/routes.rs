use {
    crate::{
        config::Config,
        filelist::{FileList, FileListItem},
    },
    rocket::{
        Responder, State, delete,
        fs::{NamedFile, TempFile},
        get,
        http::Status,
        put,
        response::{Redirect, status::NoContent},
        serde::json::Json,
        uri,
    },
    rocket_dyn_templates::{Template, context},
    serde::{Deserialize, Serialize},
    std::{
        path::{Path, PathBuf},
        time::Duration,
    },
    uuid::Uuid,
};

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
            http::Status,
            put,
            response::{Redirect, status::NoContent},
            serde::json::Json,
            uri,
        },
        rocket_dyn_templates::{Template, context},
        serde::{Deserialize, Serialize},
        std::{
            path::{Path, PathBuf},
            time::Duration,
        },
        uuid::Uuid,
    };

    #[derive(Responder)]
    enum FileGet {
        #[response(status = 200, content_type = "json")]
        JsonListing(Json<FileList>),
        #[response(status = 200, content_type = "html")]
        HtmlListing(Template),
        #[response(status = 200)]
        File(NamedFile),
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
            NamedFile::open(fullpath)
                .await
                .ok()
                .map(|file| FileGet::File(file))
        }
    }

    #[get("/", format = "html", rank = 1)]
    pub async fn get_filetypes(state: &State<Config>) -> Template {
        let mut items = state
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
    pub async fn delete(state: &State<Config>, filetype: &str, name: PathBuf) -> NoContent {
        //do we care if there isn't a file at the path given?
        if let Some(path) = state.deleteable_filetype_path(filetype) {
            let _ = std::fs::remove_file(path.join(name));
        }
        NoContent
    }

    #[put("/<filetype>/<name..>", data = "<file>")]
    pub async fn upload(
        state: &State<Config>,
        filetype: &str,
        name: PathBuf,
        mut file: TempFile<'_>,
    ) -> Option<std::io::Result<()>> {
        let dir = state.filetype_path(filetype)?; //XXX will 404, is that okay?
        let p = Path::new(dir).join(name);
        Some(file.persist_to(p).await)
    }
}

mod package {
    use {
        super::PACKAGE_TIMEOUT,
        crate::{
            config::Config,
            filelist::{FileList, FileListItem},
        },
        rocket::{
            Responder, State, delete,
            fs::{NamedFile, TempFile},
            get,
            http::Status,
            put,
            response::{Redirect, status::NoContent},
            serde::json::Json,
            uri,
        },
        rocket_dyn_templates::{Template, context},
        serde::{Deserialize, Serialize},
        std::{
            path::{Path, PathBuf},
            time::Duration,
        },
        uuid::Uuid,
    };

    //packages
    #[derive(Serialize, Default)]
    struct PackageParams {
        #[serde(skip_serializing_if = "Option::is_none")]
        set: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        patcher: Option<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        all: Option<bool>,
    }

    #[derive(Serialize)]
    struct PackageCmd {
        method: &'static str,
        id: Uuid,
        params: PackageParams,
    }

    impl PackageCmd {
        fn all() -> Self {
            PackageCmd {
                method: "package_create",
                id: Uuid::new_v4(),
                params: PackageParams {
                    all: Some(true),
                    ..Default::default()
                },
            }
        }

        fn set(name: &str) -> Self {
            PackageCmd {
                method: "package_create",
                id: Uuid::new_v4(),
                params: PackageParams {
                    set: Some(name.to_string()),
                    ..Default::default()
                },
            }
        }

        fn patcher(name: &str) -> Self {
            PackageCmd {
                method: "package_create",
                id: Uuid::new_v4(),
                params: PackageParams {
                    patcher: Some(name.to_string()),
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
        packagename: String,
        progress: f32,
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
            let id = cmd.id.clone();

            let cmd = serde_json::to_string(&cmd).unwrap();
            let packet = OscPacket::Message(OscMessage {
                addr: "/rnbo/cmd".to_string(),
                args: vec![OscType::String(cmd)],
            });

            //send cmd
            if let Ok(msg) = rosc::encoder::encode(&packet) {
                let _ = ws.send(Message::Binary(msg.into())).await;
                //wait for response, TIMEOUT!
                while let Some(message) = ws
                    .try_next()
                    .await
                    .map_err(|_| Status::PreconditionFailed)?
                {
                    if let Message::Binary(vec) = message {
                        if let Ok((_, OscPacket::Message(m))) =
                            rosc::decoder::decode_udp(vec.as_ref())
                        {
                            if m.addr == "/rnbo/resp"
                                && !m.args.is_empty()
                                && let OscType::String(resp) = &m.args[0]
                                && let Ok(resp) =
                                    serde_json::from_str::<PackageResponse>(resp.as_str())
                                && resp.id == id
                            {
                                if let Some(result) = resp.result {
                                    let path = PathBuf::from(result.filename);
                                    return Ok(Redirect::to(uri!(
                                        "/files",
                                        super::file::get_html("packages", path)
                                    )));
                                } else {
                                    eprintln!("error with package_create");
                                    return Err(Status::NotFound);
                                }
                            }
                        }
                    }
                }
            }
            Err(Status::PreconditionFailed)
        } else {
            Err(Status::PreconditionFailed)
        }
    }

    async fn get_impl(
        state: &State<Config>,
        packagetype: &str,
        name: Option<&str>,
    ) -> Result<Redirect, Status> {
        let cmd = match packagetype {
            "all" => PackageCmd::all(),
            "set" if name.is_some() => PackageCmd::set(name.unwrap()),
            "patcher" if name.is_some() => PackageCmd::patcher(name.unwrap()),
            _ => return Err(Status::NotFound),
        };

        tokio::time::timeout(PACKAGE_TIMEOUT, compute_and_redirect(cmd))
            .await
            .map_err(|_| Status::GatewayTimeout)?
    }

    #[get("/<packagetype>/<name>")]
    pub async fn get(
        state: &State<Config>,
        packagetype: &str,
        name: &str,
    ) -> Result<Redirect, Status> {
        return get_impl(state, packagetype, Some(name)).await;
    }

    #[get("/all")]
    pub async fn get_all(state: &State<Config>) -> Result<Redirect, Status> {
        return get_impl(state, "all", None).await;
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
