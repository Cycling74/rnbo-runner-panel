use {
    crate::{config::Config, filelist::FileList},
    rocket::{
        State, delete,
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
    std::path::{Path, PathBuf},
    uuid::Uuid,
};

#[get("/", format = "html")]
pub async fn filetypes(state: &State<Config>) -> Template {
    let list = state.filetypelist();
    Template::render("filetypelist", context! { list })
}

#[get("/<filetype>", format = "html", rank = 1)]
pub async fn list_html(state: &State<Config>, filetype: &str) -> Option<Template> {
    state
        .filelist(filetype)
        .map(|list| Template::render("filelist", context! { list }))
}

#[get("/<filetype>", format = "json", rank = 2)]
pub async fn list_json(state: &State<Config>, filetype: &str) -> Option<Json<FileList>> {
    state.filelist(filetype).map(Json)
}

#[get("/<filetype>/<name>")]
pub async fn download(state: &State<Config>, filetype: &str, name: PathBuf) -> Option<NamedFile> {
    let dir = state.filetype_path(filetype)?;
    NamedFile::open(dir.join(name)).await.ok()
}

#[delete("/<filetype>/<name>")]
pub async fn delete(state: &State<Config>, filetype: &str, name: PathBuf) -> NoContent {
    //do we care if there isn't a file at the path given?
    if let Some(path) = state.deleteable_filetype_path(filetype) {
        let _ = std::fs::remove_file(path.join(name));
    }
    NoContent
}

#[put("/<filetype>/<name>", data = "<file>")]
pub async fn upload(
    state: &State<Config>,
    filetype: &str,
    name: &str,
    mut file: TempFile<'_>,
) -> Option<std::io::Result<()>> {
    let dir = state.filetype_path(filetype)?; //XXX will 404, is that okay?
    let p = Path::new(dir).join(name);
    Some(file.persist_to(p).await)
}

//package
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

async fn get_package_impl(
    state: &State<Config>,
    packagetype: &str,
    name: Option<&str>,
) -> Result<Redirect, Status> {
    use {
        futures_util::{SinkExt, TryStreamExt},
        reqwest_websocket::{Message, RequestBuilderExt},
        rosc::{OscMessage, OscPacket, OscType},
    };

    let cmd = match packagetype {
        "all" => PackageCmd::all(),
        "set" if name.is_some() => PackageCmd::set(name.unwrap()),
        "patcher" if name.is_some() => PackageCmd::patcher(name.unwrap()),
        _ => return Err(Status::NotFound),
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
        }

        //wait for response, TIMEOUT!
        while let Some(message) = ws
            .try_next()
            .await
            .map_err(|_| Status::PreconditionFailed)?
        {
            if let Message::Binary(vec) = message {
                if let Ok((_, OscPacket::Message(m))) = rosc::decoder::decode_udp(vec.as_ref()) {
                    if m.addr == "/rnbo/resp"
                        && !m.args.is_empty()
                        && let OscType::String(resp) = &m.args[0]
                        && let Ok(resp) = serde_json::from_str::<PackageResponse>(resp.as_str())
                        && resp.id == id
                    {
                        if let Some(result) = resp.result {
                            let parts: Vec<String> =
                                result.filename.split("/").map(|s| s.to_string()).collect();
                            return Ok(Redirect::to(uri!(
                                "/packages",
                                get_package_file(parts[0].clone(), parts[1].clone())
                            )));
                        } else {
                            eprintln!("error with package_create");
                            return Err(Status::NotFound);
                        }
                    }
                }
            }
        }

        Err(Status::NotFound)
    } else {
        Err(Status::PreconditionFailed)
    }
}

#[get("/<packagetype>/<name>")]
pub async fn get_package(
    state: &State<Config>,
    packagetype: &str,
    name: &str,
) -> Result<Redirect, Status> {
    return get_package_impl(state, packagetype, Some(name)).await;
}

#[get("/all")]
pub async fn get_all_package(state: &State<Config>) -> Result<Redirect, Status> {
    return get_package_impl(state, "all", None).await;
}

#[get("/files/<version>/<name>")]
pub async fn get_package_file(
    state: &State<Config>,
    version: &str,
    name: &str,
) -> Result<NamedFile, Status> {
    let basedir = state
        .package_dir()
        .as_ref()
        .ok_or(Status::PreconditionFailed)?;

    let path = basedir.join(version).join(name);
    return NamedFile::open(path).await.map_err(|_| Status::NotFound);
}
