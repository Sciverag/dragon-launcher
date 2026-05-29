import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * Si el usuario no está autenticado, redirige a /login
 */
export const ProtectedRoute = ({ element }: ProtectedRouteProps) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return isLoggedIn ? element : <Navigate to="/login" replace />;
};
