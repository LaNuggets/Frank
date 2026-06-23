use crate::{error::AppError, helper::get_tmp_folder_path};


#[tauri::command]
pub fn create_project() -> Result<String, AppError> {
    let tmp_folder = get_tmp_folder_path();

    std::fs::create_dir_all(tmp_folder.join("assets"))?;
    std::fs::create_dir_all(tmp_folder.join("env"))?;

    std::fs::File::create(tmp_folder.join("config.json"))?;
    std::fs::File::create(tmp_folder.join("presentation.md"))?;
    std::fs::File::create(tmp_folder.join("style.css"))?;

    Ok(tmp_folder.to_string_lossy().to_string())
}