use std::{fs::{self, File}, path::Path, io};
use zip::ZipArchive;

use crate::{error::AppError, helper::get_tmp_folder_path};


#[tauri::command]
pub fn unzip_command(zip_path: String) -> Result<String, String> {
    unzip(zip_path).map_err(|e| e.to_string())
}

/// Create a folder that contain everythings that was in the given zip.
/// * `zip_path` - The path to the zip.
/// * `return` - The path of where the archive has been unzip.
pub fn unzip(zip_path: String) -> Result<String, AppError> {
    let zip_file_path = Path::new(&zip_path);
    let zip_file = File::open(zip_file_path)?;

    let mut archive = ZipArchive::new(zip_file)?;

    let extraction_dir = get_tmp_folder_path();

    // Create the directory if it does not exist.
    if !extraction_dir.exists() {
        std::fs::create_dir_all(&extraction_dir)?;
    }

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i)?;
        // let out_path = extraction_dir.join(entry.name());
        let out_path = match entry.enclosed_name() {
            Some(path) => extraction_dir.join(path),
            None => return Err(AppError::InvalidPath),
        };

        if entry.is_dir() {
            fs::create_dir_all(&out_path)?;
        } else {
            if let Some(parent) = out_path.parent() {
                fs::create_dir_all(parent)?;
            }
            let mut out_file = File::create(&out_path)?;
            io::copy(&mut entry, &mut out_file)?;
        }
    }
    Ok(extraction_dir.to_string_lossy().to_string())
}