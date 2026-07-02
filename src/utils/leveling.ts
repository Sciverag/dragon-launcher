import type { SteamAchievementProgress } from "../types/game";

export type AchievementQuality = "bronce" | "plata" | "oro" | "platino";

export type AchievementSnapshot = {
    appId: string;
    achievements: SteamAchievementProgress[];
    updatedAt: number;
};

export type ClaimedGameTitle = {
    gameId: string;
    gameName: string;
    title: string;
    claimedAt: number;
};

const ACHIEVEMENT_SNAPSHOTS_STORAGE_KEY = "achievementProgressSnapshots";
const CLAIMED_TITLES_STORAGE_KEY = "claimedGameTitles";
const GAME_TITLE_OVERRIDES: Record<string, string> = {};

export const ACHIEVEMENT_XP_BY_QUALITY: Record<AchievementQuality, number> = {
    bronce: 50,
    plata: 100,
    oro: 200,
    platino: 1000,
};

export function normalizeGlobalPercent(value: unknown): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string") {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

export function buildAchievementQualityMap(
    achievements: SteamAchievementProgress[],
): Map<number | null, AchievementQuality> {
    const percents = achievements
        .map((achievement) => normalizeGlobalPercent(achievement.globalPercent))
        .filter((percent): percent is number => percent !== null);

    const uniqueSorted = [...new Set(percents)].sort((a, b) => a - b);
    const map = new Map<number | null, AchievementQuality>();

    if (uniqueSorted.length === 0) {
        map.set(null, "bronce");
        return map;
    }

    const minPercent = uniqueSorted[0];
    map.set(minPercent, "platino");

    const rest = uniqueSorted.slice(1);
    const restTotal = rest.length;

    rest.forEach((percent, index) => {
        const rank = restTotal === 1 ? 0.5 : index / (restTotal - 1);
        let quality: AchievementQuality;

        if (rank <= 1 / 3) quality = "oro";
        else if (rank <= 2 / 3) quality = "plata";
        else quality = "bronce";

        map.set(percent, quality);
    });

    map.set(null, "bronce");
    return map;
}

export function getAchievementQuality(
    globalPercent: unknown,
    achievements: SteamAchievementProgress[],
): AchievementQuality {
    const qualityMap = buildAchievementQualityMap(achievements);
    return qualityMap.get(normalizeGlobalPercent(globalPercent)) ?? "bronce";
}

export function getAchievementXp(
    achievement: SteamAchievementProgress,
    achievements: SteamAchievementProgress[],
): number {
    if (!achievement.achieved) {
        return 0;
    }

    const quality = getAchievementQuality(achievement.globalPercent, achievements);
    return ACHIEVEMENT_XP_BY_QUALITY[quality];
}

export function calculateXpFromAchievements(
    achievements: SteamAchievementProgress[] | null | undefined,
): number {
    if (!Array.isArray(achievements) || achievements.length === 0) {
        return 0;
    }

    const qualityMap = buildAchievementQualityMap(achievements);

    return achievements.reduce((total, achievement) => {
        if (!achievement.achieved) {
            return total;
        }

        const quality = qualityMap.get(normalizeGlobalPercent(achievement.globalPercent)) ?? "bronce";
        return total + ACHIEVEMENT_XP_BY_QUALITY[quality];
    }, 0);
}

export function readAchievementSnapshots(
    storageKey = ACHIEVEMENT_SNAPSHOTS_STORAGE_KEY,
): AchievementSnapshot[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const storedValue = window.localStorage.getItem(storageKey);
        if (!storedValue) return [];

        const parsed = JSON.parse(storedValue) as AchievementSnapshot[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveAchievementSnapshot(
    appId: string,
    achievements: SteamAchievementProgress[] | null | undefined,
    storageKey = ACHIEVEMENT_SNAPSHOTS_STORAGE_KEY,
): void {
    if (typeof window === "undefined") {
        return;
    }

    const snapshots = readAchievementSnapshots(storageKey).filter(
        (snapshot) => snapshot.appId !== appId,
    );

    if (!Array.isArray(achievements) || achievements.length === 0) {
        window.localStorage.setItem(storageKey, JSON.stringify(snapshots));
        return;
    }

    snapshots.push({
        appId,
        achievements,
        updatedAt: Date.now(),
    });

    window.localStorage.setItem(storageKey, JSON.stringify(snapshots));
}

export function calculateTotalXpFromStoredAchievements(
    storageKey = ACHIEVEMENT_SNAPSHOTS_STORAGE_KEY,
): number {
    return readAchievementSnapshots(storageKey).reduce(
        (total, snapshot) => total + calculateXpFromAchievements(snapshot.achievements),
        0,
    );
}

export function getGameTitle(
    gameId: string | number | undefined,
    gameName: string | undefined,
    customTitles: Record<string, string> = GAME_TITLE_OVERRIDES,
): string {
    const normalizedGameId = gameId === undefined || gameId === null ? "" : String(gameId);
    const fallbackTitle = gameName?.trim() || "Jugador";

    if (!normalizedGameId) {
        return fallbackTitle;
    }

    return customTitles[normalizedGameId]?.trim() || fallbackTitle;
}

function readClaimedGameTitles(
    storageKey = CLAIMED_TITLES_STORAGE_KEY,
): ClaimedGameTitle[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const storedValue = window.localStorage.getItem(storageKey);
        if (!storedValue) return [];

        const parsed = JSON.parse(storedValue) as ClaimedGameTitle[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function dedupeTitles(titles: Array<string | null | undefined>): string[] {
    const seen = new Set<string>();

    return titles.reduce<string[]>((accumulator, title) => {
        const normalizedTitle = title?.trim();
        if (!normalizedTitle) {
            return accumulator;
        }

        const lookupKey = normalizedTitle.toLowerCase();
        if (seen.has(lookupKey)) {
            return accumulator;
        }

        seen.add(lookupKey);
        accumulator.push(normalizedTitle);
        return accumulator;
    }, []);
}

export function getUnlockedTitlesFromStorage(
    storageKey = CLAIMED_TITLES_STORAGE_KEY,
): string[] {
    return dedupeTitles(
        readClaimedGameTitles(storageKey)
            .map((entry) => entry.title?.trim())
            .filter((title): title is string => Boolean(title)),
    );
}

export function getClaimedTitleForGame(
    gameId: string | number | undefined,
    storageKey = CLAIMED_TITLES_STORAGE_KEY,
): ClaimedGameTitle | null {
    const normalizedGameId = gameId === undefined || gameId === null ? "" : String(gameId);
    if (!normalizedGameId) {
        return null;
    }

    return readClaimedGameTitles(storageKey).find((entry) => entry.gameId === normalizedGameId) ?? null;
}

export function claimGameTitle(
    gameId: string | number | undefined,
    gameName: string | undefined,
    customTitles: Record<string, string> = GAME_TITLE_OVERRIDES,
    storageKey = CLAIMED_TITLES_STORAGE_KEY,
): ClaimedGameTitle | null {
    const normalizedGameId = gameId === undefined || gameId === null ? "" : String(gameId);
    if (!normalizedGameId) {
        return null;
    }

    const existingClaim = getClaimedTitleForGame(normalizedGameId, storageKey);
    if (existingClaim) {
        return existingClaim;
    }

    const nextClaim: ClaimedGameTitle = {
        gameId: normalizedGameId,
        gameName: gameName?.trim() || "",
        title: getGameTitle(normalizedGameId, gameName, customTitles),
        claimedAt: Date.now(),
    };

    if (typeof window !== "undefined") {
        const nextClaims = [...readClaimedGameTitles(storageKey), nextClaim];
        window.localStorage.setItem(storageKey, JSON.stringify(nextClaims));
    }

    return nextClaim;
}

export function getLevelThreshold(level: number): number {
    if (level <= 1) return 1000;
    return Math.round(1000 * 10 ** ((level - 1) / 9));
}

export function getLevelProgress(xp: number) {
    const clampedXp = Math.max(0, Math.floor(xp));
    let level = 1;

    while (getLevelThreshold(level + 1) <= clampedXp) {
        level += 1;
    }

    const currentLevelThreshold = getLevelThreshold(level);
    const nextLevelThreshold = getLevelThreshold(level + 1);
    const xpIntoCurrentLevel = Math.max(0, clampedXp - currentLevelThreshold);
    const xpNeededForNextLevel = Math.max(
        0,
        nextLevelThreshold - clampedXp,
    );
    const progressPercent =
        currentLevelThreshold >= nextLevelThreshold
            ? 100
            : Math.min(
                100,
                Math.round(
                    (xpIntoCurrentLevel / (nextLevelThreshold - currentLevelThreshold)) * 100,
                ),
            );

    return {
        level,
        xp: clampedXp,
        currentLevelThreshold,
        nextLevelThreshold,
        xpIntoCurrentLevel,
        xpNeededForNextLevel,
        progressPercent,
    };
}
