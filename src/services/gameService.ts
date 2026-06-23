import axios from "axios";
import type { SteamPlayerAchievementsResponse } from "../types/game";

export async function getGameDetails(gameId: string | number) {
    const res = await axios.get(
        `/steam-api/api/appdetails?appids=${gameId}`
    );


    return res.data[gameId].data;
}

export async function getGameAssets(gameId: string | number, platform: string) {
    const res = await axios.get(
        `http://localhost:4500/assets/steam/${gameId}/${platform.toLowerCase()}`
    )

    return res.data;
}

export async function getSteamPlayerAchievements(gameId: string | number, token: string) {
    const res = await axios.get(
        `http://localhost:4500/assets/steam/achievements/${gameId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return res.data as SteamPlayerAchievementsResponse;
}