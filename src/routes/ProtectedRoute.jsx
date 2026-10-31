import { Navigate, useLocation, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { usePermiso } from "../hooks/usePermiso";
import { Spinner } from "../components/ui/Spinner";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

/**
 * ProtectedRoute — nuevo sistema de permisos por módulo.
 *
 * Props:
 *  - requiredModulo: string  — módulo requerido (USUARIOS, CLIENTES, etc.)
 *  - requiredNivel: 'LECTURA'|'ESCRITURA' — nivel mínimo (default: 'LECTURA')
 *  - children / Outlet
 *
 * Compatibilidad legada (se mantiene para no romper rutas no migradas):
 *  - allowedPermisos: string[]  — ignora si ya existe requiredModulo
 *  - allowedRoles: string[]     — ignora si ya existe requiredModulo
 */
export function ProtectedRoute({
  requiredModulo,
  requiredNivel = "LECTURA",
  allowedPermisos = [],
  allowedRoles = [],
  children,
}) {
  const { isAuthenticated, loading, can, usuario } = useAuth();
  const location = useLocation();

  // Evaluar permiso por módulo (nuevo sistema)
  const permisoModulo = usePermiso(requiredModulo ?? "__NONE__");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  // Sin sesión → redirigir a /login guardando la ruta previa
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Nuevo sistema: validar por módulo ───────────────────────────────────
  if (requiredModulo) {
    if (!permisoModulo.puedeVer && requiredNivel === "LECTURA") {
      return <Navigate to="/" replace />;
    }
    if (!permisoModulo.puedeEscribir && requiredNivel === "ESCRITURA") {
      return <Navigate to="/" replace />;
    }
    return children ? children : <Outlet />;
  }

  // ── Legado: validación por roles ────────────────────────────────────────
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

  // ── Legado: validación por códigos de permiso ───────────────────────────
  if (allowedPermisos.length > 0 && !can(...allowedPermisos)) {
    return <UnauthorizedPage requiredPermisos={allowedPermisos} />;
  }

  return children ? children : <Outlet />;
}
