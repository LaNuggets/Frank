use std::{fs, path::Path};

use crate::{error::AppError, helper::get_tmp_folder_path};

#[derive(serde::Serialize)]
pub struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<FileNode>>,
}


#[tauri::command]
pub fn get_workspace_tree() -> Result<FileNode, AppError> {
    let base = get_tmp_folder_path();

    build_tree(&base)
}


///This function gonna build the tree of the tmp folder in a json like style.
/// 
/// * `path` - The path to the tmp folder.
/// * `return` - FileNode containing all the tree of a string for error.
fn build_tree(path: &Path) -> Result<FileNode, AppError> {
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "root".into());

    let metadata = fs::metadata(path)?;

    let is_dir = metadata.is_dir();

    if is_dir {
        let mut children = Vec::new();

        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let child_path = entry.path();

            children.push(build_tree(&child_path)?);
        }

        Ok(FileNode {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir: true,
            children: Some(children),
        })
    } else {
        Ok(FileNode {
            name,
            path: path.to_string_lossy().to_string(),
            is_dir: false,
            children: None,
        })
    }
}