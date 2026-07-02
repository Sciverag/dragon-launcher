import { create } from 'zustand';
import axios from 'axios';
import type { User } from '../types/user';
import { getGameDetails, getSteamPlayerAchievements, hasValidSteamAchievements } from '../services/gameService';
import { useLibraryStore } from './libraryStore';
import {
  calculateTotalXpFromStoredAchievements,
  claimGameTitle,
  dedupeTitles,
  getLevelProgress,
  readAchievementSnapshots,
  saveAchievementSnapshot,
} from '../utils/leveling';

const mergeUserWithServerData = (currentUser: User, serverUser?: Partial<User> | null) => {
  if (!serverUser) {
    return currentUser;
  }

  return {
    ...currentUser,
    ...(serverUser.id !== undefined ? { id: serverUser.id } : {}),
    ...(serverUser.email !== undefined ? { email: serverUser.email } : {}),
    ...(serverUser.username !== undefined ? { username: serverUser.username } : {}),
    ...(serverUser.avatar !== undefined ? { avatar: serverUser.avatar } : {}),
    ...(serverUser.hero !== undefined ? { hero: serverUser.hero } : {}),
    ...(serverUser.steamId !== undefined ? { steamId: serverUser.steamId } : {}),
    level: serverUser.level !== undefined ? Math.max(currentUser.level ?? 1, serverUser.level ?? currentUser.level ?? 1) : currentUser.level,
    xp: serverUser.xp !== undefined ? Math.max(currentUser.xp ?? 0, serverUser.xp ?? currentUser.xp ?? 0) : currentUser.xp,
    ...(serverUser.equippedTitle !== undefined ? { equippedTitle: serverUser.equippedTitle ?? null } : {}),
    ...(serverUser.unlockedTitles !== undefined ? { unlockedTitles: dedupeTitles(serverUser.unlockedTitles ?? []) } : {}),
  };
};

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  isRecalculatingAchievements: boolean;
  login: (user: User, token: string) => Promise<void>;
  register: (user: User, token: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  claimTitle: (gameId: string, gameName: string, titleName?: string) => Promise<void>;
  equipTitle: (title: string) => Promise<void>;
  recalculateUserLevelFromAchievements: () => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,
  isRecalculatingAchievements: false,

  login: async (user: User, token: string) => {

    if (!token) {
      throw new Error('No se recibio un token de autenticacion valido');
    }

    try {
      useLibraryStore.getState().resetLibrary();

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', token)

      set({
        isLoggedIn: true,
        user: user,
        token: token
      });
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  register: async (user: User, token: string) => {

    if (!token) {
      throw new Error('No se recibio un token de autenticacion valido');
    }

    try {
      useLibraryStore.getState().resetLibrary();

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', token)
      set({
        isLoggedIn: true,
        user: user,
        token: token
      });
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  updateUser: (userUpdate: Partial<User>) => {
    const currentUser = useAuthStore.getState().user;

    if (!currentUser) {
      return;
    }

    const nextUser = {
      ...currentUser,
      ...userUpdate,
    };

    localStorage.setItem('user', JSON.stringify(nextUser));

    set({
      user: nextUser,
    });
  },

  claimTitle: async (gameId: string, gameName: string, titleName?: string) => {
    const currentUser = useAuthStore.getState().user;
    const token = useAuthStore.getState().token;

    if (!currentUser || !token) {
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:4500/auth/titles/claim',
        { gameId, gameName, titleName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const nextUser = mergeUserWithServerData(currentUser, response.data?.user);
      localStorage.setItem('user', JSON.stringify(nextUser));
      set({ user: nextUser });
    } catch (error) {
      console.error('Failed to claim title:', error);
      throw error;
    }
  },

  equipTitle: async (title: string) => {
    const currentUser = useAuthStore.getState().user;
    const token = useAuthStore.getState().token;
    const normalizedTitle = title?.trim();

    if (!currentUser || !normalizedTitle || !token) {
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:4500/auth/titles/equip',
        { titleName: normalizedTitle },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const serverUser = response.data?.user;
      const nextUser = mergeUserWithServerData(currentUser, {
        ...serverUser,
        equippedTitle: normalizedTitle,
      });

      localStorage.setItem('user', JSON.stringify(nextUser));
      set({ user: nextUser });
    } catch (error) {
      console.error('Failed to equip title:', error);
      throw error;
    }
  },

  recalculateUserLevelFromAchievements: async () => {
    const initialUser = useAuthStore.getState().user;
    const token = useAuthStore.getState().token;

    if (!initialUser || !token || useAuthStore.getState().isRecalculatingAchievements) {
      return;
    }

    set({ isRecalculatingAchievements: true });

    console.log('Recalculating user level from achievements...');

    try {
      let currentUser: User = initialUser;
      const libraryGames = useLibraryStore.getState().games;
      const snapshotIndex = new Map(
        readAchievementSnapshots().map((snapshot) => [snapshot.appId, snapshot]),
      );
      const autoClaimedTitles = new Set<string>();

      for (const game of libraryGames) {
        const appId = String(game.id);

        try {
          const gameDetails = await getGameDetails(appId).catch(() => null);
          if (!hasValidSteamAchievements(gameDetails?.achievements)) {
            saveAchievementSnapshot(appId, []);
            snapshotIndex.delete(appId);
            continue;
          }

          const playerStats = await getSteamPlayerAchievements(appId, token);

          if (!Array.isArray(playerStats?.achievements) || playerStats.achievements.length === 0 || playerStats.totalCount === 0) {
            saveAchievementSnapshot(appId, []);
            snapshotIndex.delete(appId);
            continue;
          }

          saveAchievementSnapshot(appId, playerStats.achievements);
          snapshotIndex.set(appId, {
            appId,
            achievements: playerStats.achievements,
            updatedAt: Date.now(),
          });

          const isCompleted = (playerStats.totalCount ?? 0) > 0 && (playerStats.unlockedCount ?? 0) >= (playerStats.totalCount ?? 0);
          if (isCompleted && game?.name) {
            const nextClaim = claimGameTitle(appId, game.name);
            const titleName = nextClaim?.title?.trim();

            if (titleName) {
              const normalizedTitle = titleName.toLowerCase();
              const alreadyUnlocked = Boolean(
                currentUser?.unlockedTitles?.some((title) => title?.trim().toLowerCase() === normalizedTitle),
              );

              if (!alreadyUnlocked && !autoClaimedTitles.has(normalizedTitle)) {
                await useAuthStore.getState().claimTitle(appId, game.name, titleName);
                autoClaimedTitles.add(normalizedTitle);
                const refreshedUser = useAuthStore.getState().user;
                currentUser = refreshedUser ?? currentUser;
              }
            }
          }
        } catch (error) {
          const shouldClearGameSnapshot = axios.isAxiosError(error)
            && [400, 404].includes(error.response?.status ?? 0);

          if (shouldClearGameSnapshot) {
            saveAchievementSnapshot(appId, []);
            snapshotIndex.delete(appId);
            continue;
          }

          console.warn(`Failed to refresh achievements for ${appId}; keeping previous snapshot if available.`, error);
        }
      }

      const nextXp = calculateTotalXpFromStoredAchievements();
      const nextLevelProgress = getLevelProgress(nextXp);
      let nextUser: User = {
        ...currentUser,
        xp: nextXp,
        level: nextLevelProgress.level,
      };

      try {
        const response = await axios.post(
          'http://localhost:4500/auth/progression/update',
          { level: nextLevelProgress.level, xp: nextXp },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        nextUser = mergeUserWithServerData(nextUser, response.data?.user);
      } catch (error) {
        console.warn('Failed to persist progression to backend; keeping local values.', error);
      }

      localStorage.setItem('user', JSON.stringify(nextUser));

      set({
        user: nextUser,
      });
    } finally {
      set({ isRecalculatingAchievements: false });
    }
  },

  logout: () => {

    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token')

    set({
      isLoggedIn: false,
      user: null,
      token: null
    });
  },

  checkAuth: () => {

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (isLoggedIn && userStr && token && token !== 'undefined') {
      try {
        const user = JSON.parse(userStr);
        set({
          isLoggedIn: true,
          user,
          token,
        });
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('token');

      set({
        isLoggedIn: false,
        user: null,
        token: null,
      });
    }
  },
}));
