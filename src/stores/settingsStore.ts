import { create } from "zustand";

const SETTINGS_STORAGE_KEY = "launcherSettings";

export type WindowMode = "windowed" | "maximized" | "fullscreen";

export type ResolutionOption = "1280x720" | "1366x768" | "1600x900" | "1920x1080";

export interface LauncherSettings {
    windowMode: WindowMode;
    resolution: ResolutionOption;
    audioVolume: number;
    audioMuted: boolean;
}

interface SettingsState extends LauncherSettings {
    setWindowMode: (windowMode: WindowMode) => void;
    setResolution: (resolution: ResolutionOption) => void;
    setAudioVolume: (audioVolume: number) => void;
    setAudioMuted: (audioMuted: boolean) => void;
}

const DEFAULT_SETTINGS: LauncherSettings = {
    windowMode: "windowed",
    resolution: "1920x1080",
    audioVolume: 0.25,
    audioMuted: false,
};

const clampVolume = (value: number) => Math.max(0, Math.min(1, value));

const readStoredSettings = (): LauncherSettings => {
    if (typeof window === "undefined") {
        return DEFAULT_SETTINGS;
    }

    try {
        const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

        if (!raw) {
            return DEFAULT_SETTINGS;
        }

        const parsed = JSON.parse(raw) as Partial<LauncherSettings>;

        const nextWindowMode =
            parsed.windowMode === "windowed" ||
                parsed.windowMode === "maximized" ||
                parsed.windowMode === "fullscreen"
                ? parsed.windowMode
                : DEFAULT_SETTINGS.windowMode;

        const nextResolution =
            parsed.resolution === "1280x720" ||
                parsed.resolution === "1366x768" ||
                parsed.resolution === "1600x900" ||
                parsed.resolution === "1920x1080"
                ? parsed.resolution
                : DEFAULT_SETTINGS.resolution;

        return {
            windowMode: nextWindowMode,
            resolution: nextResolution,
            audioVolume: clampVolume(parsed.audioVolume ?? DEFAULT_SETTINGS.audioVolume),
            audioMuted: Boolean(parsed.audioMuted),
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
};

const saveSettings = (settings: LauncherSettings) => {
    if (typeof window === "undefined") {
        return;
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    ...readStoredSettings(),
    setWindowMode: (windowMode) => {
        set({ windowMode });
        saveSettings(get());
    },
    setResolution: (resolution) => {
        set({ resolution });
        saveSettings(get());
    },
    setAudioVolume: (audioVolume) => {
        set({ audioVolume: clampVolume(audioVolume) });
        saveSettings(get());
    },
    setAudioMuted: (audioMuted) => {
        set({ audioMuted });
        saveSettings(get());
    },
}));
