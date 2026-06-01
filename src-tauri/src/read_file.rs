use std::fs::read_to_string;
use std::fmt;
use std::io;
use tauri::ipc::InvokeError;

#[derive(Debug)]
pub enum AppError {
    WrongLinesFormat,
    IoError(String),
    ParseError(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppError::WrongLinesFormat => write!(f, "Wrong lines format"),
            AppError::IoError(e) => write!(f, "IO error: {}", e),
            AppError::ParseError(e) => write!(f, "Parse error: {}", e),
        }
    }
}

impl From<AppError> for InvokeError {
    fn from(e: AppError) -> Self {
        InvokeError::from(e.to_string())
    }
}

impl From<std::num::ParseIntError> for AppError {
    fn from(e: std::num::ParseIntError) -> Self {
        AppError::ParseError(e.to_string())
    }
}

impl From<io::Error> for AppError {
    fn from(e: io::Error) -> Self {
        AppError::IoError(e.to_string())
    }
}


#[tauri::command]
pub fn read_file_content_command(filename: &str, lines: &str) -> Result<Vec<String>, AppError> {
    read_lines(filename, lines)
}


/// Read file content.
/// 
/// * `filename` - A string containing only the file name (e.g : "main.rs")
/// * `lines` - A string containing the line to get (e.g : "5-20" to get lines 5 to 20)
/// * `return` - A vector with all the lines.
fn read_lines(filename: &str, lines: &str) -> Result<Vec<String>, AppError> {
    let mut result = Vec::new();
    let all_lines: Vec<i32> = get_lines(lines)?;
 
    let mut i : i32 = 0;

    for line in read_to_string(filename)?.lines() {
        i += 1;
        if i > all_lines[all_lines.len()-1] {
            break;
        }

        if all_lines.contains(&i) {
            result.push(line.to_string());
        }
    }
    Ok(result)
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