use std::{fs, path::Path};

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {

    fs::write(Path::new(&path), content)
        .map_err(|e| e.to_string())
}