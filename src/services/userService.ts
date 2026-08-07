import axios from "axios";
import type { User } from "../types/user";
import type { game, SteamAchievementProgress } from "../types/game";

type AchievementSnapshotResponse = {
    appId: string;
    achievements: SteamAchievementProgress[];
    updatedAt: number;
};

export type PublicAchievementsOverviewResponse = {
    games: game[];
    snapshots: AchievementSnapshotResponse[];
};

export async function getUserProfile(userId: string) {
    const response = await axios.get<{ user: User }>(
        `http://localhost:4500/users/${userId}`,
    );

    return response.data.user;
}

export async function getPublicAchievementsOverview(userId: string) {
    const response = await axios.get<PublicAchievementsOverviewResponse>(
        `http://localhost:4500/assets/steam/users/${userId}/achievements-overview`,
    );

    return response.data;
}