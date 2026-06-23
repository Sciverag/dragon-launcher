export type game = {
    id: string | number;
    name: string;
    cover?: string;
    header?: string;
    logo?: string;
    icon?: string;
    background?: string;
    platform: "Steam" | "Epic" | "Custom";
    last_played: number;
    isLocal?: boolean;
};

export type game_detail = {
    id: string | number;
    name: string;
    logo?: string;
    background: string;
    developer: string;
    release: string;
    played_time: string;
    description: string;
    trailer: string;
    trailerPoster?: string;
    achievements?: {
        higlighted: {},
        total: number
    };
}

export type Achievement = {
    icon: string,
    name: string,
    description: string,
    unlocked: boolean,
}

export type SteamAchievementProgress = {
    apiName: string;
    name: string;
    description: string;
    hidden: boolean;
    icon: string;
    iconGray: string;
    achieved: boolean;
    unlockTime: number | null;
    globalPercent: number | null;
};

export type SteamPlayerAchievementsResponse = {
    appId: number;
    steamId: string;
    unlockedCount: number;
    totalCount: number;
    achievements: SteamAchievementProgress[];
};