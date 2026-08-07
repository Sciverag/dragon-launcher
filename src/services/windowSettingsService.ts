import { isTauri } from "@tauri-apps/api/core";
import type {
    ResolutionOption,
    WindowMode,
} from "../stores/settingsStore";
import { useSettingsStore } from "../stores/settingsStore";

let hasAppliedInitialWindowSettings = false;

export async function applyWindowSettings(
    windowMode: WindowMode,
    resolution: ResolutionOption,
) {
    if (!isTauri()) {
        return;
    }

    const [{ getCurrentWindow }, { LogicalSize }] = await Promise.all([
        import("@tauri-apps/api/window"),
        import("@tauri-apps/api/dpi"),
    ]);

    const appWindow = getCurrentWindow();
    await appWindow.setResizable(true);

    if (windowMode === "fullscreen") {
        await appWindow.setFullscreen(true);
        return;
    }

    await appWindow.setFullscreen(false);

    if (windowMode === "maximized") {
        await appWindow.maximize();
        return;
    }

    await appWindow.unmaximize();
    const [width, height] = resolution.split("x").map(Number);
    await appWindow.setSize(new LogicalSize(width, height));
    await appWindow.center();
}

export async function applyInitialWindowSettings() {
    if (hasAppliedInitialWindowSettings) {
        return;
    }

    hasAppliedInitialWindowSettings = true;

    const { windowMode, resolution } = useSettingsStore.getState();
    await applyWindowSettings(windowMode, resolution);
}
