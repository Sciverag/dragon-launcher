import { invoke } from "@tauri-apps/api/core";
import axios from "axios";
import type { game } from "../types/game";
import { useAuthStore } from "../stores/authStore";

export async function getSteamLocalLibrary() {
    const localGames = await invoke<game[]>("get_steam_library");

    return localGames.map<game>((entry) => ({
        ...entry,
        platform: "Steam" as const,
        isLocal: true,
    }));
}

export async function getSteamLibrary() {
    const { token } = useAuthStore.getState();

    if (!token) {
        throw new Error("Debes iniciar sesion para obtener la libreria de Steam");
    }

    const response = await axios.get<game[]>("http://localhost:4500/assets/steam/library", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data.map<game>((entry) => ({
        ...entry,
        platform: "Steam" as const,
        isLocal: false,
    }));
}

export async function mergeLibraries(localGames: game[], remoteGames: game[]) {
    const mergedGames: game[] = [];

    const remoteGamesMap = new Map(remoteGames.map((game) => [game.id, game]));

    for (const localGame of localGames) {
        const remoteGame = remoteGamesMap.get(localGame.id);

        if (remoteGame) {
            mergedGames.push({
                ...localGame,
                ...remoteGame,
                isLocal: true,
            });
        }

        else {
            mergedGames.push(localGame);
        }
    }

    for (const remoteGame of remoteGames) {
        if (!localGames.some((game) => game.id === remoteGame.id)) {
            mergedGames.push(remoteGame);
        }
    }
    return mergedGames.sort((a, b) => b.last_played - a.last_played);
}