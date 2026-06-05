import { useAuthStore } from '../stores/authStore';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  avatar?: string;
  username: string;
  email: string;
  password: string;
}

export const authService = {

  async login(credentials: LoginCredentials): Promise<void> {

    if (!credentials.email || !credentials.password) {
      throw new Error('El email y contraseña son requeridos');
    }


    if (credentials.password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }


    const { login } = useAuthStore.getState();
    await login(credentials.email);
  },

  async register(credentials: RegisterCredentials): Promise<void> {

    if (!credentials.email || !credentials.password || !credentials.username) {
      throw new Error('El email, nombre de usuario y contraseña son requeridos');
    }
    if (credentials.password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }

    const { register } = useAuthStore.getState();
    await register(credentials.email);
  },


  logout(): void {
    const { logout } = useAuthStore.getState();
    logout();
  },


  isAuthenticated(): boolean {
    const { isLoggedIn } = useAuthStore.getState();
    return isLoggedIn;
  },


  getCurrentUser() {
    const { user } = useAuthStore.getState();
    return user;
  },
};
