import { create } from "zustand";

const ORIENTATION_STORAGE_KEY = "libraryOrientation";

type LibraryOrientation = "grid" | "list";

interface LibraryState {
    orientation: LibraryOrientation;
    setOrientation: (orientation: LibraryOrientation) => void;
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
    setOrientation: (orientation) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(ORIENTATION_STORAGE_KEY, orientation);
        }

        set({ orientation });
    },
}));
