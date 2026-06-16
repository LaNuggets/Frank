// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod file;
use file::read_file::read_file_lines_command;
use file::read_file::read_file;
use file::write_file::write_file;

mod archive;
use archive::zip::zip_command;
use archive::unzip::unzip_command;

mod helper;
use helper::get_base_path;

mod folder;
use folder::clear::clear_tmp_folder;
use folder::tree::get_workspace_tree;
use folder::create_project::create_project;

use tauri_plugin_dialog;



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_file_lines_command, read_file, write_file, zip_command, unzip_command, get_base_path, clear_tmp_folder, get_workspace_tree, create_project])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}