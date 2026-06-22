use thiserror::Error;
use std::num::ParseIntError;

#[derive(Debug, Error)]
pub enum AppError {

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Zip error: {0}")]
    Zip(#[from] zip::result::ZipError),

    #[error("Parse error: {0}")]
    Parse(#[from] ParseIntError),

    #[error("Wrong lines format")]
    WrongLinesFormat,

    #[error("Missing main files; at least one of the 3 main files is not present. Be sure that you have: style.css, presentation.md, and config.json")]
    MissingMainFiles,
}