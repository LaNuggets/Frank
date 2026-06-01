// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod read_file;
use read_file::read_file_content_command;
mod export;
use export::zip_command;
use export::unzip_command;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![read_file_content_command, zip_command, unzip_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
