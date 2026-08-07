import { isTauri } from "@tauri-apps/api/core";
import { appDataDir, join } from "@tauri-apps/api/path";
import { exists, remove } from "@tauri-apps/plugin-fs";

const ACHIEVEMENT_SNAPSHOTS_STORAGE_KEY = "achievementProgressSnapshots";
const CLAIMED_TITLES_STORAGE_KEY = "claimedGameTitles";

function clearLocalStorageCaches() {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.removeItem(ACHIEVEMENT_SNAPSHOTS_STORAGE_KEY);
    window.localStorage.removeItem(CLAIMED_TITLES_STORAGE_KEY);
}

async function clearDiskCache() {
    if (!isTauri()) {
        return false;
    }

    const base = await appDataDir();
    const cacheDir = await join(base, "dragon-launcher", "cache");
    const cacheExists = await exists(cacheDir);

    if (!cacheExists) {
        return false;
    }

    await remove(cacheDir, { recursive: true });
    return true;
}

export async function clearLocalAppCache() {
    clearLocalStorageCaches();
    const removedDiskCache = await clearDiskCache();

    return {
        removedDiskCache,
    };
}
