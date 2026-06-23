use std::env;
use std::path::PathBuf;

use crate::error::AppError;


#[tauri::command]
pub fn get_base_path() -> Result<String, AppError> {
        Ok(std::env::current_dir()?
        .to_string_lossy()
        .to_string())
}


/// This function return the path to the tmp created folder where project is store when opened
pub fn get_tmp_folder_path() -> PathBuf {
    env::temp_dir().join("codeprez")
}