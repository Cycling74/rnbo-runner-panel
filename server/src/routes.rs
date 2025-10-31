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
    state.filelist(filetype).map(|list| Json(list))
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
