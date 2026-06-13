#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_http::init())
    .invoke_handler(tauri::generate_handler![
      get_steam_library
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

use serde::Serialize;
mod steam;

use steam::parser::{self, Game};

#[tauri::command]
fn get_steam_library() -> Vec<Game> {
    steam::parser::get_local_steam_games()
}