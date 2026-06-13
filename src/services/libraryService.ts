import { invoke } from "@tauri-apps/api/core";
import type { game } from "../types/game";

export async function getSteamLocalLibrary() {
    const localGames = invoke<game[]>("get_steam_library");
    (await localGames).forEach((game) => {
        game.platform = "Steam"
    })
    return localGames;
}

export async function getSteamLibrary() {
    const games: game[] = [
        {
            id: 3784760,
            name: "Elfie: A Sand Plan",
            platform: "Steam",
        },
        {
            id: 2375550,
            name: "Like a Dragon: Gaiden - The Man Who Erased His Name",
            platform: "Steam",
        },
        {
            id: 1659420,
            name: "Uncharted: Legacy of Thieves Collection",
            platform: "Steam",
        },
        {
            id: 1895880,
            name: "Ratchet and Clank - Rift Apart",
            platform: "Steam",
        },
        {
            id: 1922560,
            name: "Plant's vs Zombies Garden Warfare 2",
            platform: "Steam",
        },
        {
            id: 504230,
            name: "Celeste",
            platform: "Steam",
        },
        {
            id: 1113000,
            name: "Persona 4 Golden",
            platform: "Steam",
        },
        {
            id: 314810,
            name: "Randal's Monday",
            platform: "Steam",
        },
        {
            id: 3241660,
            name: "R.E.P.O",
            platform: "Steam",
        },
        {
            id: 250900,
            name: "The Binding of Isaac Rebirth",
            platform: "Steam",
        },
        {
            id: 1903340,
            name: "Expedition 33",
            platform: "Steam",
        },
        {
            id: 460790,
            name: "Bayoneta",
            platform: "Steam",
        },
        {
            id: 2679460,
            name: "Metaphor ReFantazio",
            platform: "Steam",
        },
        {
            id: 1145360,
            name: "Hades",
            platform: "Steam",
        },
        {
            id: 1426210,
            name: "It Takes Two",
            platform: "Steam",
        },
    ];

    return games
}