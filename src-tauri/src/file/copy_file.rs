use std::fs;
use std::path::Path;

use crate::error::AppError;
use crate::helper::get_tmp_folder_path;

#[tauri::command]
pub fn copy_file(file_path: String) -> Result<(), AppError> {
    let fp = Path::new(&file_path);

    let file_name = fp
        .file_name()
        .ok_or_else(|| AppError::InvalidFileName(file_path))?;

    let path = get_tmp_folder_path();

    let new_file_path = path.join("assets/").join(file_name);

    fs::copy(fp, new_file_path)?;

    Ok(())
}