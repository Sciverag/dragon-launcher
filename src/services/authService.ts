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
  /**
   * Realiza el login del usuario
   * @param credentials - Credenciales del usuario (email, password)
   * @returns Promise que se resuelve cuando el login es exitoso
   */
  async login(credentials: LoginCredentials): Promise<void> {
    // Aquí puedes implementar:
    // 1. Validación básica
    // 2. Llamada a API real
    // 3. Gestión de tokens/sesiones

    if (!credentials.email || !credentials.password) {
      throw new Error('El email y contraseña son requeridos');
    }

    // Validación simple (ejemplo)
    if (credentials.password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }

    // Aquí iría la lógica real de autenticación
    // Por ahora solo pasamos el email al store
    const { login } = useAuthStore.getState();
    await login(credentials.email);
  },

  async register(credentials: RegisterCredentials): Promise<void> {
    // Aquí puedes implementar:
    // 1. Validación básica
    // 2. Llamada a API real para registrar al usuario
    // 3. Gestión de tokens/sesiones si es necesario
    if (!credentials.email || !credentials.password || !credentials.username) {
      throw new Error('El email, nombre de usuario y contraseña son requeridos');
    }
    if (credentials.password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }
    // Aquí iría la lógica real de registro
    // Por ahora solo pasamos el email al store
    const { register } = useAuthStore.getState();
    await register(credentials.email);
  },

  /**
   * Realiza el logout del usuario
   */
  logout(): void {
    const { logout } = useAuthStore.getState();
    logout();
  },

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const { isLoggedIn } = useAuthStore.getState();
    return isLoggedIn;
  },

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser() {
    const { user } = useAuthStore.getState();
    return user;
  },
};
