import { Navigate, useLocation, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "../components/ui/Spinner";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

export function ProtectedRoute({ allowedPermisos = [], allowedRoles = [], children }) {
  const { isAuthenticated, loading, can, usuario } = useAuth();
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

  // Validación de roles permitidos (ej: ['GERENTE', 'ADMIN'])
  if (allowedRoles.length > 0) {
    const userRole = (usuario?.rol_nombre || "").toUpperCase();
    const hasRole = allowedRoles.some((r) => {
      const target = r.toUpperCase();
      return (
        userRole === target ||
        (target === "ADMIN" && (userRole.includes("ADMIN") || usuario?.rol_id === 1)) ||
        (target === "GERENTE" && (userRole.includes("GERENTE") || usuario?.rol_id === 5))
      );
    });
    if (!hasRole) {
      return <UnauthorizedPage requiredPermisos={allowedRoles} />;
    }
  }

  // Con sesión pero sin permiso -> Mostrar página de bloqueo explícita
  if (allowedPermisos.length > 0 && !can(...allowedPermisos)) {
    return <UnauthorizedPage requiredPermisos={allowedPermisos} />;
  }

  return children ? children : <Outlet />;
}
