import { create } from 'zustand';
import type { User } from '../types/user';
interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  login: (user: User, token: string) => Promise<void>;
  register: (user: User, token: string) => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  token: null,

  login: async (user: User, token: string) => {

    if (!token) {
      throw new Error('No se recibio un token de autenticacion valido');
    }

    try {
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
