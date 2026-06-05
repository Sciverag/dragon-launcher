import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  user: { username: string } | null;
  login: (username: string) => Promise<void>;
  register: (username: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,

  login: async (username: string) => {

    try {

      await new Promise((resolve) => setTimeout(resolve, 500));


      localStorage.setItem('user', JSON.stringify({ username }));
      localStorage.setItem('isLoggedIn', 'true');

      set({
        isLoggedIn: true,
        user: { username },
      });
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  register: async (username: string) => {

    try {

      await new Promise((resolve) => setTimeout(resolve, 500));

      localStorage.setItem('user', JSON.stringify({ username }));
      localStorage.setItem('isLoggedIn', 'true');
      set({
        isLoggedIn: true,
        user: { username },
      });
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  logout: () => {

    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');

    set({
      isLoggedIn: false,
      user: null,
    });
  },

  checkAuth: () => {

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userStr = localStorage.getItem('user');

    if (isLoggedIn && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          isLoggedIn: true,
          user,
        });
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    }
  },
}));
