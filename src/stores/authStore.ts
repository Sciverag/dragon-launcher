import { create } from 'zustand';
import axios from 'axios';
import type { User } from '../types/user';
import { getSteamPlayerAchievementsBatch } from '../services/gameService';
import { useLibraryStore } from './libraryStore';
import {
  calculateTotalXpFromStoredAchievements,
  claimGameTitle,
  dedupeTitles,
  getLevelProgress,
  readAchievementSnapshots,
  saveAchievementSnapshot,
} from '../utils/leveling';

const ACHIEVEMENT_INCREMENTAL_SYNC_TTL_MS = 1000 * 60 * 60 * 6;
const AUTH_REFRESH_ENDPOINT = 'http://localhost:4500/auth/refresh';
const AUTH_REFRESH_BUFFER_MS = 1000 * 60;
const ACCESS_TOKEN_STORAGE_KEY = 'token';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';

let refreshTimerId: ReturnType<typeof setTimeout> | null = null;
let refreshInterceptorInstalled = false;
let refreshInFlight: Promise<boolean> | null = null;

type JwtPayload = {
  exp?: number;
  tokenType?: 'access' | 'refresh';
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');

    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

function getTokenExpiryMs(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp || !Number.isFinite(payload.exp)) {
    return null;
  }

  return payload.exp * 1000;
}

function clearScheduledTokenRefresh() {
  if (refreshTimerId) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }
}

function scheduleTokenRefresh(token: string | null | undefined) {
  clearScheduledTokenRefresh();

  if (!token) {
    return;
  }

  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) {
    return;
  }

  const delayMs = Math.max(expiryMs - Date.now() - AUTH_REFRESH_BUFFER_MS, 0);
  refreshTimerId = setTimeout(() => {
    void useAuthStore.getState().refreshSession();
  }, delayMs);
}

function installAuthRefreshInterceptor() {
  if (refreshInterceptorInstalled) {
    return;
  }

  refreshInterceptorInstalled = true;

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as {
        _retry?: boolean;
        url?: string;
        headers?: Record<string, string>;
      } | undefined;
      const status = error.response?.status;

      if (
        status === 401
        && originalRequest
        && !originalRequest._retry
        && !String(originalRequest.url ?? '').includes('/auth/refresh')
      ) {
        originalRequest._retry = true;

        const refreshed = await useAuthStore.getState().refreshSession();
        if (refreshed) {
          const nextToken = useAuthStore.getState().token;

          if (nextToken) {
            originalRequest.headers = {
              ...(originalRequest.headers ?? {}),
              Authorization: `Bearer ${nextToken}`,
            };
          }

          return axios(originalRequest);
        }
      }

      return Promise.reject(error);
    },
  );
}

function persistSession(user: User, token: string, refreshToken?: string | null) {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  scheduleTokenRefresh(token);
}

installAuthRefreshInterceptor();

function shouldRefreshAchievementSnapshot(
  updatedAt: number | undefined,
  lastPlayedUnixSeconds: number | undefined,
) {
  if (!updatedAt || !Number.isFinite(updatedAt)) {
    return true;
  }

  const isStale = Date.now() - updatedAt >= ACHIEVEMENT_INCREMENTAL_SYNC_TTL_MS;
  if (isStale) {
    return true;
  }

  if (!lastPlayedUnixSeconds || !Number.isFinite(lastPlayedUnixSeconds) || lastPlayedUnixSeconds <= 0) {
    return false;
  }

  const lastPlayedAtMs = lastPlayedUnixSeconds * 1000;
  return lastPlayedAtMs > updatedAt;
}

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
  refreshToken: string | null;
  user: User | null;
  isRecalculatingAchievements: boolean;
  login: (user: User, token: string, refreshToken?: string | null) => Promise<void>;
  register: (user: User, token: string, refreshToken?: string | null) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  claimTitle: (gameId: string, gameName: string, titleName?: string) => Promise<void>;
  equipTitle: (title: string) => Promise<void>;
  recalculateUserLevelFromAchievements: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,
  refreshToken: null,
  isRecalculatingAchievements: false,

  login: async (user: User, token: string, refreshToken?: string | null) => {

    if (!token) {
      throw new Error('No se recibio un token de autenticacion valido');
    }

    try {
      useLibraryStore.getState().resetLibrary();

      persistSession(user, token, refreshToken);

      set({
        isLoggedIn: true,
        user: user,
        token: token,
        refreshToken: refreshToken ?? null,
      });
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  register: async (user: User, token: string, refreshToken?: string | null) => {

    if (!token) {
      throw new Error('No se recibio un token de autenticacion valido');
    }

    try {
      useLibraryStore.getState().resetLibrary();

      persistSession(user, token, refreshToken);
      set({
        isLoggedIn: true,
        user: user,
        token: token,
        refreshToken: refreshToken ?? null,
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
      const autoClaimedTitles = new Set<string>();
      const snapshotByAppId = new Map(
        readAchievementSnapshots().map((snapshot) => [snapshot.appId, snapshot]),
      );
      const appIdsToRefresh = libraryGames
        .filter((game) => {
          const appId = String(game.id);
          const snapshot = snapshotByAppId.get(appId);
          return shouldRefreshAchievementSnapshot(snapshot?.updatedAt, game.last_played);
        })
        .map((game) => game.id);
      const achievementsByAppId = new Map(
        (
          appIdsToRefresh.length > 0
            ? await getSteamPlayerAchievementsBatch(appIdsToRefresh, token)
            : []
        ).map((response) => [String(response.appId), response]),
      );

      for (const game of libraryGames) {
        const appId = String(game.id);

        try {
          const playerStats = achievementsByAppId.get(appId);
          const existingSnapshot = snapshotByAppId.get(appId);

          if (playerStats && (!Array.isArray(playerStats.achievements) || playerStats.achievements.length === 0 || playerStats.totalCount === 0)) {
            saveAchievementSnapshot(appId, []);
            snapshotByAppId.delete(appId);
            continue;
          }

          if (playerStats && Array.isArray(playerStats.achievements) && playerStats.achievements.length > 0) {
            saveAchievementSnapshot(appId, playerStats.achievements);
            snapshotByAppId.set(appId, {
              appId,
              achievements: playerStats.achievements,
              updatedAt: Date.now(),
            });
          }

          const achievements = playerStats?.achievements ?? existingSnapshot?.achievements ?? [];
          const totalCount = achievements.length;
          const unlockedCount = achievements.filter((achievement) => achievement.achieved).length;

          const isCompleted = totalCount > 0 && unlockedCount >= totalCount;
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

  refreshSession: async () => {
    const currentRefreshToken = useAuthStore.getState().refreshToken
      ?? localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

    if (!currentRefreshToken) {
      return false;
    }

    if (refreshInFlight) {
      return refreshInFlight;
    }

    refreshInFlight = (async () => {
      try {
        const response = await axios.post(AUTH_REFRESH_ENDPOINT, {
          refresh_token: currentRefreshToken,
        });

        const nextUser = response.data?.user;
        const nextToken = response.data?.access_token;
        const nextRefreshToken = response.data?.refresh_token;

        if (!nextUser || !nextToken || !nextRefreshToken) {
          throw new Error('Respuesta invalida al refrescar la sesion');
        }

        persistSession(nextUser, nextToken, nextRefreshToken);

        set({
          isLoggedIn: true,
          user: nextUser,
          token: nextToken,
          refreshToken: nextRefreshToken,
        });

        return true;
      } catch (error) {
        console.warn('Failed to refresh auth session:', error);
        useAuthStore.getState().logout();
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  },

  logout: () => {

    clearScheduledTokenRefresh();

    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

    set({
      isLoggedIn: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  },

  checkAuth: async () => {

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

    if (isLoggedIn && userStr && token && token !== 'undefined') {
      try {
        const user = JSON.parse(userStr);

        const tokenExpiryMs = getTokenExpiryMs(token);
        if (!tokenExpiryMs || tokenExpiryMs - Date.now() <= AUTH_REFRESH_BUFFER_MS) {
          if (refreshToken) {
            const refreshed = await useAuthStore.getState().refreshSession();
            if (refreshed) {
              return;
            }
          } else if (!tokenExpiryMs || tokenExpiryMs <= Date.now()) {
            useAuthStore.getState().logout();
            return;
          }
        }

        if (refreshToken) {
          scheduleTokenRefresh(token);
        } else {
          clearScheduledTokenRefresh();
        }
        set({
          isLoggedIn: true,
          user,
          token,
          refreshToken: refreshToken ?? null,
        });
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        useAuthStore.getState().logout();
      }
    } else {
      useAuthStore.getState().logout();
    }
  },
}));
