import { Navigate, useLocation, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "../components/ui/Spinner";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

export function ProtectedRoute({ allowedPermisos = [], children }) {
  const { isAuthenticated, loading, can } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  // Sin sesión -> redirigir a /login guardando la ruta previa
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Con sesión pero sin permiso -> Mostrar página de bloqueo explícita
  if (allowedPermisos.length > 0 && !can(...allowedPermisos)) {
    return <UnauthorizedPage requiredPermisos={allowedPermisos} />;
  }

  return children ? children : <Outlet />;
}
