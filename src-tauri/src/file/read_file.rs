use std::ffi::OsStr;
use std::fs::read_to_string;
use std::path::PathBuf;
use std::{fs, path::Path};


use crate::helper::get_tmp_folder_path;
use crate::error::AppError;

#[tauri::command]
pub fn read_file(file_name: String) -> Result<String, String> {
    let path = get_tmp_folder_path().join(file_name);

    fs::read_to_string(Path::new(&path))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_file_lines_command(filename: &str, lines: &str) -> Result<(Vec<String>, Option<String>), AppError> {
    read_lines(filename, lines)
}


/// Read file content.
/// 
/// * `filename` - A string containing only the file name (e.g : "main.rs")
/// * `lines` - A string containing the line to get (e.g : "5-20" to get lines 5 to 20)
/// * `return` - A vector with all the lines.
fn read_lines(filename: &str, lines: &str) -> Result<(Vec<String>, Option<String>), AppError> {
    let mut result: Vec<String> = Vec::new();
    let all_lines: Vec<i32> = get_lines(lines)?;
    let tmp_folder: PathBuf = get_tmp_folder_path();
    let file_path = tmp_folder.join(filename);
    let extention = file_path.extension().and_then(OsStr::to_str).map(|s| s.to_string());

    let mut i : i32 = 0;

    for line in read_to_string(file_path)?.lines() {
        i += 1;
        if i > all_lines[all_lines.len()-1] {
            break;
        }

        if all_lines.contains(&i) {
            result.push(line.to_string());
        }
    }
    Ok((result, extention))
}


/// Read a string of format "5-20" and
/// return all the int between 5 and 20 includes.
/// 
/// * `lines` - A string containing the line to get (e.g : "5-20" to get lines 5 to 20)
/// * `return` - A vector with all the lines in i32
fn get_lines(lines: &str) -> Result<Vec<i32>, AppError> {
    let mut lines_int: Vec<i32> = Vec::new();

    match lines.find("-") {
        Some(index) => {
            let _iter = lines.char_indices();

            let first_line = &lines[..index];
            let last_line = &lines[index + 1..];

            let first = first_line.parse::<i32>()?;
            let last = last_line.parse::<i32>()?;

            if first > last {
                return Err(AppError::WrongLinesFormat);
            }
            for n in first..last+1 {
                lines_int.push(n);
            }
        },
        None => return Err(AppError::WrongLinesFormat),
    }
    if lines_int.is_empty() {
        return Err(AppError::WrongLinesFormat);
    }

    Ok(lines_int)
}