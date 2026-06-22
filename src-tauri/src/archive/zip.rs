use std::{fs::File, path::Path, io::{self, Read, Write}};
use std::path::PathBuf;
use std::fmt;
use zip::{ZipWriter, CompressionMethod, write::{ExtendedFileOptions, FileOptions}};

use crate::helper::get_tmp_folder_path;

use crate::error::AppError;


#[tauri::command]
pub fn zip_command(zip_path: String, files_name: Vec<String>) -> Result<(), String> {
    let resolved: Vec<String> = files_name
        .iter()
        .map(|f| {
            std::fs::canonicalize(f)
                .map(|p| p.to_string_lossy().to_string())
                .unwrap_or(f.clone())
        })
        .collect();

    zip(zip_path, resolved).map_err(|e| e.to_string())
}


// pub fn zip(zip_path: String, files_and_folders_name: Vec<String>) -> zip::result::ZipResult<()>{
pub fn zip(zip_path: String, files_and_folders_name: Vec<String>) -> Result<(), AppError>{
    let zip_path = ensure_codeprez_extension(PathBuf::from(zip_path));
    let (mut archive, options) = create_archive(zip_path)?;

    let (files, folders) = split_files_and_folders(files_and_folders_name);
    if !check_main_file_validity(&files) {
        return Err(AppError::MissingMainFiles);
    }
    let (files_path, folders_path) = complete_file_and_folder_path(files, folders);

    zip_files(&mut archive, &options, files_path)?;
    zip_folders(&mut archive, &options, folders_path)?;
    archive.finish()?;

    Ok(())
}

fn ensure_codeprez_extension(mut path: PathBuf) -> PathBuf {
    path.set_extension("codeprez");

    path
}

fn check_main_file_validity(files: &Vec<String>) -> bool {
    for file in files {
        if file != "style.css"
        || file != "presentation.md"
        || file != "config.json"
        {
            return false;
        }
    }
    true
}

fn complete_file_and_folder_path(files: Vec<String>, folders: Vec<String>) -> (Vec<PathBuf>, Vec<PathBuf>) {
    let tmp_folder = get_tmp_folder_path();

    let mut files_path: Vec<PathBuf> = vec![];
    let mut folders_path: Vec<PathBuf> = vec![];

    for file in files {
        files_path.push(Path::new(&tmp_folder).join(file));
    }
    for folder in folders {
        folders_path.push(Path::new(&tmp_folder).join(folder));
    }

    (files_path, folders_path)
}


/// Create an archive with its compression option
/// * `zip_path` - The path of where to create this archive
pub fn create_archive(zip_path: PathBuf) -> Result<(ZipWriter<File>, FileOptions<'static, ExtendedFileOptions>), io::Error> {
    let zip_file = File::create(zip_path)?;
    let zip = ZipWriter::new(zip_file);
    let options = FileOptions::default().compression_method(CompressionMethod::DEFLATE);
    Ok((zip, options))
}


/// Split into tuple of Vec<String> files and folders
/// * `files_and_folders_name` - A vector containing all files/folders name
pub fn split_files_and_folders(files_and_folders_name:  Vec<String>) -> (Vec<String>, Vec<String>) {
    let mut files: Vec<String> = vec![];
    let mut folders: Vec<String> = vec![];

    for name in files_and_folders_name {
        if name.contains('.') {
            files.push(name);
        } else {
            folders.push(name);
        }
    }
    (files, folders)
}


/// Zip files in the given archive
/// * `archive` - The archive to put the zipped folder in
/// * `path` - a string containing the path and the file name (e.g: home/user/Work/Rust/Frank/example.codeprez)
/// * `files_name` - a vector of string containing all the files to add to the .codeprez
pub fn zip_files(
    archive: &mut ZipWriter<File>,
    options: &FileOptions<'_, ExtendedFileOptions>,
    files_path: Vec<PathBuf>) -> zip::result::ZipResult<()>
    {

    for file_path in &files_path {
        let file = File::open(file_path)?;
        let file_name = file_path.file_name().unwrap().to_str().unwrap();
        archive.start_file(file_name, options.clone())?;

        let mut buffer = Vec::new();
        io::copy(&mut file.take(u64::MAX), &mut buffer)?;

        archive.write_all(&buffer)?;
    }

    Ok(())
}


/// Zip folders in the given archive
/// * `archive` - The archive to put the zipped folder in
/// * `options` - The compression options
/// * `folders_path` - a vector of string containing all the folders to add to the .codeprez
pub fn zip_folders(
    archive: &mut ZipWriter<File>,
    options: &FileOptions<'static, ExtendedFileOptions>,
    folders_path: Vec<PathBuf>,
) -> zip::result::ZipResult<()> {
    for folder_path in folders_path.iter() {
        let folder_name = folder_path.file_name().unwrap().to_str().unwrap();

        // Walk recursively through all entries in the folder
        for entry in walkdir::WalkDir::new(folder_path) {
            let entry = entry.map_err(|e| zip::result::ZipError::Io(e.into()))?;
            let path = entry.path();

            // Build the path inside the zip: folder_name/subfolder/file.txt
            let zip_path = format!(
                "{}/{}",
                folder_name,
                path.strip_prefix(folder_path).unwrap().display()
            );

            if path.is_dir() {
                archive.add_directory(&zip_path, options.clone())?;
            } else {
                archive.start_file(&zip_path, options.clone())?;
                let mut buffer = Vec::new();
                io::copy(&mut File::open(path)?.take(u64::MAX), &mut buffer)?;
                archive.write_all(&buffer)?;
            }
        }
    }
    Ok(())
}
