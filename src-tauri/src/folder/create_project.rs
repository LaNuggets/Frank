use crate::helper::get_tmp_folder_path;


#[tauri::command]
pub fn create_project() -> Result<String, String> {
    let tmp_folder = get_tmp_folder_path();

    std::fs::create_dir_all(tmp_folder.join("assets")).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(tmp_folder.join("env")).map_err(|e| e.to_string())?;

    std::fs::File::create(tmp_folder.join("config.json")).map_err(|e| e.to_string())?;
    std::fs::File::create(tmp_folder.join("presentation.md")).map_err(|e| e.to_string())?;
    std::fs::File::create(tmp_folder.join("style.css")).map_err(|e| e.to_string())?;

    Ok(tmp_folder.to_string_lossy().to_string())
}