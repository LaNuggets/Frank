use std::{fs::{self, File}, path::Path};
use std::path::PathBuf;
use std::io::{self, Read, Write};
use zip::{ZipWriter, CompressionMethod, ZipArchive, write::{ExtendedFileOptions, FileOptions}};

#[tauri::command]
pub fn zip_command(zip_path: String, files_name: Vec<String>) -> Result<(), String> {
    zip(zip_path, files_name).map_err(|e| e.to_string())
}


#[tauri::command]
pub fn unzip_command(zip_path: String) -> Result<(), String> {
    unzip(zip_path).map_err(|e| e.to_string())
}


pub fn zip(zip_path: String, files_and_folder_name: Vec<String>) -> zip::result::ZipResult<()>{
    let (mut archive, options) = create_archive(&zip_path)?;

    let (files, folder) = split_file_and_folder(files_and_folder_name);
    zip_files(&mut archive, &options, files)?;
    zip_folders(&mut archive, &options, folder)?;
    archive.finish()?;

    Ok(())
}


/// Create an archive with its compression option
/// * `zip_path` - The path of where to create this archive
pub fn create_archive(zip_path: &str) -> Result<(ZipWriter<File>, FileOptions<'static, ExtendedFileOptions>), io::Error> {
    let zip_file = File::create(zip_path)?;
    let zip = ZipWriter::new(zip_file);
    let options = FileOptions::default().compression_method(CompressionMethod::DEFLATE);
    Ok((zip, options))
}


/// Split into tuple of Vec<String> files and folder
/// * `files_and_folder_name` - A vector containing all files/folders name
pub fn split_file_and_folder(files_and_folder_name:  Vec<String>) -> (Vec<String>, Vec<String>) {
    let mut files: Vec<String> = vec![];
    let mut folder: Vec<String> = vec![];
    for name in files_and_folder_name {
        if name.contains('.') {
            files.push(name);
        } else {
            folder.push(name);
        }
    }
    (files, folder)
}


/// Zip files in the given archive
/// * `archive` - The archive to put the zipped folder in
/// * `path` - a string containing the path and the file name (e.g: home/user/Work/Rust/Frank/example.codeprez)
/// * `files_name` - a vector of string containing all the files to add to the .codeprez
pub fn zip_files(
    archive: &mut ZipWriter<File>,
    options: &FileOptions<'_, ExtendedFileOptions>,
    files_name: Vec<String>) -> zip::result::ZipResult<()>
    {

    let mut files_to_compress: Vec<PathBuf> = vec![];
    for file in files_name {
        files_to_compress.push(PathBuf::from(file));
    }

    for file_path in &files_to_compress {
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
    folders_path: Vec<String>,
) -> zip::result::ZipResult<()> {
    for folder_path in folders_path.iter().map(Path::new) {
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


/// Create a folder that contain everythings that was in the given zip.
/// * `zip_path` - The path to the zip.
pub fn unzip(zip_path: String) -> zip::result::ZipResult<()> {
    let zip_file_path = Path::new(&zip_path);
    let zip_file = File::open(zip_file_path)?;

    let mut archive = ZipArchive::new(zip_file)?;
    let extraction_dir = Path::new("codeprez");

    // Create the directory if it does not exist.
    if !extraction_dir.exists() {
        std::fs::create_dir_all(extraction_dir)?;
    }

    for i in 0..archive.len() {
        let mut entry = archive.by_index(i)?;
        let out_path = extraction_dir.join(entry.name());
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
    Ok(())
}