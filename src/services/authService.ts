import { useAuthStore } from '../stores/authStore';
import axios from 'axios';

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
    try {
      const response = await axios.post('http://localhost:4500/auth/login', credentials);
      const { login } = useAuthStore.getState();
      await login(response.data.user, response.data.access_token, response.data.refresh_token);
    } catch (error) {
      throw new Error(String(error));
    }
  },

  async register(credentials: RegisterCredentials): Promise<void> {

    if (!credentials.email || !credentials.password || !credentials.username) {
      throw new Error('El email, nombre de usuario y contraseña son requeridos');
    }
    if (credentials.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    try {
      const response = await axios.post('http://localhost:4500/auth/register', credentials);
      const { register } = useAuthStore.getState();
      await register(response.data.user, response.data.access_token, response.data.refresh_token);
    } catch (error) {
      throw new Error(String(error));
    }


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

  connectSteam(returnPath = '/settings'): void {
    const { token } = useAuthStore.getState();

    if (!token) {
      throw new Error('Debes iniciar sesion para conectar Steam');
    }

    const normalizedReturnPath = returnPath.startsWith('/')
      ? returnPath
      : '/settings';
    const returnTo = `${window.location.origin}${normalizedReturnPath}`;
    const steamLinkUrl = new URL('http://localhost:4500/auth/steam');
    steamLinkUrl.searchParams.set('token', token);
    steamLinkUrl.searchParams.set('returnTo', returnTo);

    window.location.href = steamLinkUrl.toString();
  },

  async disconnectSteam(): Promise<void> {
    const { token, updateUser } = useAuthStore.getState();

    if (!token) {
      throw new Error('Debes iniciar sesion para desconectar Steam');
    }

    const response = await axios.post(
      'http://localhost:4500/auth/steam/disconnect',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const updatedUser = response.data?.user;

    if (updatedUser) {
      updateUser({
        steamId: updatedUser.steamId ?? undefined,
      });
    } else {
      updateUser({
        steamId: undefined,
      });
    }
  },
};
