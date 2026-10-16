import { Routes, Route, Navigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { UsuariosPage } from "../pages/UsuariosPage";
import { RolesPage } from "../pages/RolesPage";
import { ClientesPage } from "../pages/ClientesPage";
import { ProductosPage } from "../pages/ProductosPage";
import { MarcasPage } from "../pages/MarcasPage";
import { ProveedoresPage } from "../pages/ProveedoresPage";
import { ComprasPage } from "../pages/ComprasPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage initialMode="login" />} />
      <Route path="/register" element={<LoginPage initialMode="register" />} />

      {/* Rutas protegidas dentro del DashboardLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Inicio / Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Módulo Usuarios */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute allowedPermisos={["USUARIOS_GESTIONAR"]}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Roles y permisos */}
        <Route
          path="roles"
          element={
            <ProtectedRoute allowedPermisos={["ROLES_GESTIONAR"]}>
              <RolesPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Clientes */}
        <Route
          path="clientes"
          element={
            <ProtectedRoute allowedPermisos={["CLIENTES_GESTIONAR"]}>
              <ClientesPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Productos */}
        <Route
          path="productos"
          element={
            <ProtectedRoute allowedPermisos={["PRODUCTOS_VER", "PRODUCTOS_GESTIONAR"]}>
              <ProductosPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Proveedores */}
        <Route path="proveedores" element={<ProtectedRoute allowedPermisos={["PRODUCTOS_VER", "PRODUCTOS_GESTIONAR"]}><ProveedoresPage /></ProtectedRoute>} />

        {/* Módulo Compras */}
        <Route path="compras" element={<ProtectedRoute allowedPermisos={["PRODUCTOS_VER", "PRODUCTOS_GESTIONAR"]}><ComprasPage /></ProtectedRoute>} />

        {/* Módulo Marcas */}
        <Route
          path="marcas"
          element={
            <ProtectedRoute allowedPermisos={["PRODUCTOS_VER", "PRODUCTOS_GESTIONAR"]}>
              <MarcasPage />
            </ProtectedRoute>
          }
        />

        {/* 404 dentro del layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 404 global */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
