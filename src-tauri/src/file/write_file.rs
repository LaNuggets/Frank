use std::{fs, path::Path};

use crate::helper::get_tmp_folder_path;

#[tauri::command]
pub fn write_file(file_name: String, content: String) -> Result<(), String> {
    let path = get_tmp_folder_path().join(file_name);

    fs::write(Path::new(&path), content)
        .map_err(|e| e.to_string()) // Handle error
}