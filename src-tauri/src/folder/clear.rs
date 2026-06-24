use std::fs;
use crate::{error::AppError, helper::get_tmp_folder_path};

#[tauri::command]
pub fn clear_tmp_folder() -> Result<(), AppError> {
    let tmp_dir = get_tmp_folder_path();

    if tmp_dir.exists() {
        fs::remove_dir_all(&tmp_dir)?;
    }
    Ok(())
}