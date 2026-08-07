import axios from "axios";
import type { SteamPlayerAchievementsResponse } from "../types/game";

export function hasValidSteamAchievements(achievementsData: unknown): boolean {
    if (!achievementsData || typeof achievementsData !== "object") {
        return false;
    }

    const total = (achievementsData as { total?: unknown }).total;
    return typeof total === "number" && Number.isFinite(total) && total > 0;
}

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

export async function getSteamPlayerAchievementsBatch(
    gameIds: Array<string | number>,
    token: string,
) {
    const appIds = Array.from(
        new Set(
            gameIds
                .map((gameId) => Number(gameId))
                .filter((gameId) => Number.isFinite(gameId)),
        ),
    );

    if (appIds.length === 0) {
        return [] as SteamPlayerAchievementsResponse[];
    }

    const res = await axios.post(
        "http://localhost:4500/assets/steam/achievements/batch",
        { appIds },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    );

    return res.data as SteamPlayerAchievementsResponse[];
}