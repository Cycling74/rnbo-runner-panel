use {
    crate::{
        config::Config,
        filelist::FileList,
    },
    rocket::{
        State, delete,
        fs::{NamedFile, TempFile},
        get, put,
        response::status::NoContent,
        serde::json::Json,
    },
    rocket_dyn_templates::{Template, context},
    std::path::{Path, PathBuf},
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
