use std::fs::read_to_string;

/// Read file content.
/// 
/// * `filename` - A string containing only the file name (e.g : "main.rs")
/// * `lines` - A string containing the line to get (e.g : "5-20" to get lines 5 to 20)
/// * `return` - A vector with all the lines.
#[tauri::command]
pub fn read_lines(filename: &str, lines: &str) -> Vec<String> {
    let mut result = Vec::new();
    let all_lines: Vec<i32> = get_lines(lines);
    let mut i : i32 = 0;

    for line in read_to_string(filename).unwrap().lines() {
        i += 1;
        if i > all_lines[all_lines.len()-1] {
            break;
        }

        if all_lines.contains(&i) {
            result.push(line.to_string());
        }
    }
    result
}


/// Read a string of format "5-20" and
/// return all the int between 5 and 20 includes.
/// 
/// * `lines` - A string containing the line to get (e.g : "5-20" to get lines 5 to 20)
/// * `return` - A vector with all the lines in i32
fn get_lines(lines: &str) -> Vec<i32> {
    let mut lines_int: Vec<i32> = Vec::new();

    match lines.find("-") {
        Some(index) =>  {
            let _iter = lines.char_indices();

            let first_line = &lines[..index];
            let last_line = &lines[index + 1..];

            let first = first_line.parse::<i32>().unwrap();
            let last = last_line.parse::<i32>().unwrap();
            for n in first..last+1 {
                lines_int.push(n);
            }
        },
        None => println!("Nothing"),
    }
    return lines_int;
}