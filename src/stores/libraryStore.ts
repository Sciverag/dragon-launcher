import { create } from "zustand";
import type { game } from "../types/game";

const ORIENTATION_STORAGE_KEY = "libraryOrientation";

type LibraryOrientation = "grid" | "list";

interface LibraryState {
    orientation: LibraryOrientation;
    games: game[];
    hasLoadedGames: boolean;
    setOrientation: (orientation: LibraryOrientation) => void;
    setGames: (games: game[]) => void;
}

const getInitialOrientation = (): LibraryOrientation => {
    if (typeof window === "undefined") {
        return "list";
    }

    const stored = localStorage.getItem(ORIENTATION_STORAGE_KEY);
    return stored === "grid" ? "grid" : "list";
};

export const useLibraryStore = create<LibraryState>((set) => ({
    orientation: getInitialOrientation(),
    games: [],
    hasLoadedGames: false,
    setOrientation: (orientation) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(ORIENTATION_STORAGE_KEY, orientation);
        }

        set({ orientation });
    },
    setGames: (games) => {
        set({ games, hasLoadedGames: true });
    },
}));
