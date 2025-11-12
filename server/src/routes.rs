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
            http::Status,
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
            NamedFile::open(fullpath).await.ok().map(FileGet::File)
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
            .ok_or(Status::BadRequest)?;
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
    ) -> Result<std::io::Result<()>, Status> {
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

        Ok(file.persist_to(fullpath).await)
    }
}

mod package {
    use {
        super::PACKAGE_TIMEOUT,
        crate::config::Config,
        rocket::{State, get, http::Status, response::Redirect, uri},
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
        fn all(config: PackageCreateConfig) -> Self {
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

mod userview {

    //USED AI to help with this, had to mix a couple of results

    use {
        image::{ImageBuffer, Rgb},
        rocket::{
            futures::Stream,
            get,
            response::{Responder, stream::ByteStream},
        },
        std::io::Cursor,
        tokio::time::Duration,
    };

    // Helper function to generate a dummy image (same as before)
    fn generate_image_frame(width: u32, height: u32, frame_num: u32) -> Vec<u8> {
        let mut img = ImageBuffer::new(width, height);
        for x in 0..width {
            for y in 0..height {
                let r = ((x as f32 / width as f32) * 255.0) as u8;
                let g = ((y as f32 / height as f32) * 255.0) as u8;
                let b = (frame_num % 255) as u8;
                img.put_pixel(x, y, Rgb([r, g, b]));
            }
        }

        let mut cursor = Cursor::new(Vec::new());
        img.write_to(&mut cursor, image::ImageFormat::Jpeg)
            .expect("Failed to encode image");
        cursor.into_inner()
    }

    #[derive(Responder)]
    #[response(content_type = "multipart/x-mixed-replace; boundary=frame")]
    pub struct MJPEGStream<S> {
        inner: ByteStream<S>,
    }

    #[get("/custom_stream")]
    pub fn custom_stream_handler() -> MJPEGStream<impl Stream<Item = Vec<u8>> + Send + 'static> {
        let inner = ByteStream! {
            let mut interval = tokio::time::interval(Duration::from_millis(20));
            let mut frame_count = 0;

            loop {
                interval.tick().await;

                let frame_bytes = generate_image_frame(640, 480, frame_count);
                frame_count += 1;

                let mut formatted_frame = Vec::new();
                formatted_frame.extend_from_slice(b"--frame\r\n");
                formatted_frame.extend_from_slice(b"Content-Type: image/jpeg\r\n\r\n");
                formatted_frame.extend_from_slice(&frame_bytes);
                formatted_frame.extend_from_slice(b"\r\n");

                yield formatted_frame;
            }
        };

        MJPEGStream { inner }
    }
}

pub fn file_routes() -> Vec<rocket::Route> {
    rocket::routes![
        file::get_filetypes,
        file::get_html,
        file::get_json,
        file::upload,
        file::delete,
        userview::custom_stream_handler,
    ]
}

pub fn package_routes() -> Vec<rocket::Route> {
    rocket::routes![package::get, package::get_all]
}

pub fn userview_routes() -> Vec<rocket::Route> {
    rocket::routes![userview::custom_stream_handler]
}
