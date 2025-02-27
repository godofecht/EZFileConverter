#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            
            // Enable file drop
            window.set_file_drop_enabled(true)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 