use std::fs;
use crate::helper::get_tmp_folder_path;

#[tauri::command]
pub fn clear_tmp_folder() -> Result<(), String> {
    let tmp_dir = get_tmp_folder_path();

    if tmp_dir.exists() {
        fs::remove_dir_all(&tmp_dir).map_err(|e| e.to_string())?;
    }
    Ok(())
}