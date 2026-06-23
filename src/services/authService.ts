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

    await axios.post('http://localhost:4500/auth/login', credentials).then((response) => {
      const { login } = useAuthStore.getState();
      login(response.data.user, response.data.access_token);
    }
    ).catch((error) => {
      throw new Error(error)
    })
  },

  async register(credentials: RegisterCredentials): Promise<void> {

    if (!credentials.email || !credentials.password || !credentials.username) {
      throw new Error('El email, nombre de usuario y contraseña son requeridos');
    }
    if (credentials.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    await axios.post('http://localhost:4500/auth/register', credentials).then((response) => {
      const { register } = useAuthStore.getState();
      register(response.data.user, response.data.access_token);
    }).catch((error) => {
      throw new Error(error)
    })


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

  connectSteam(): void {
    const { token } = useAuthStore.getState();

    if (!token) {
      throw new Error('Debes iniciar sesion para conectar Steam');
    }

    const returnTo = `${window.location.origin}/profile`;
    const steamLinkUrl = new URL('http://localhost:4500/auth/steam');
    steamLinkUrl.searchParams.set('token', token);
    steamLinkUrl.searchParams.set('returnTo', returnTo);

    window.location.href = steamLinkUrl.toString();
  },
};
