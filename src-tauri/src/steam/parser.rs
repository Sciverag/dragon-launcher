use std::fs;
use serde::Serialize;

#[derive(Serialize)]
pub struct Game {
    pub id: u32,
    pub name: String,
    pub last_played: String
}

pub fn get_local_steam_games() -> Vec<Game> {
    let steam_path = "C:\\Program Files (x86)\\Steam\\steamapps";

    let mut games = vec![];

    let entries = fs::read_dir(steam_path);

    if let Ok(entries) = entries {
        for entry in entries.flatten() {
            let path = entry.path();

            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if name.starts_with("appmanifest_") {
                    let content = fs::read_to_string(&path).unwrap_or_default();

                    let id = content
                        .lines()
                        .find(|l| l.contains("\"appid\""))
                        .and_then(|l| l.split('"').nth(3))
                        .unwrap_or("0")
                        .parse::<u32>()
                        .unwrap_or(0);

                    let name = content
                        .lines()
                        .find(|l| l.contains("\"name\""))
                        .and_then(|l| l.split('"').nth(3))
                        .unwrap_or("Unknown")
                        .to_string();

                    let last_played = content
                        .lines()
                        .find(|l| l.contains("\"LastPlayed\""))
                        .and_then(|l| l.split('"').nth(3))
                        .unwrap_or("Unknown")
                        .to_string();

                    games.push(Game { id, name, last_played });
                }
            }
        }
    }

    games
}