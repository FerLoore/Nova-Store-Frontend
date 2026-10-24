import { Routes, Route } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { UsuariosPage } from "../pages/UsuariosPage";
import { RolesPage } from "../pages/RolesPage";
import { ClientesPage } from "../pages/ClientesPage";
import { ProductosPage } from "../pages/ProductosPage";
import { MarcasPage } from "../pages/MarcasPage";
import { NuevoPedidoPage } from "../pages/NuevoPedidoPage";
import { AprobacionesPage } from "../pages/AprobacionesPage";
import { VentasPage } from "../pages/VentasPage";
import { ReportesPage } from "../pages/ReportesPage";
import { AuditoriaPage } from "../pages/AuditoriaPage";
import { InventarioPage } from "../pages/InventarioPage";
import { ComprasPage } from "../pages/ComprasPage";
import { ProveedoresPage } from "../pages/ProveedoresPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
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

            {/* Módulo Inventario y Stock */}
        <Route path="inventario" element={<ProtectedRoute allowedPermisos={["PRODUCTOS_VER", "PRODUCTOS_GESTIONAR"]}><InventarioPage /></ProtectedRoute>} />

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

        {/* Módulo Pedidos - Vista "Nuevo Pedido" */}
        <Route
          path="pedidos"
          element={
            <ProtectedRoute>
              <NuevoPedidoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos/nuevo"
          element={
            <ProtectedRoute>
              <NuevoPedidoPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Aprobaciones - Vista "Aprobaciones" (Solo Gerente o Admin) */}
        <Route
          path="pedidos/aprobaciones"
          element={
            <ProtectedRoute allowedRoles={["GERENTE", "ADMIN"]}>
              <AprobacionesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="aprobaciones"
          element={
            <ProtectedRoute allowedRoles={["GERENTE", "ADMIN"]}>
              <AprobacionesPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Ventas */}
        <Route
          path="ventas"
          element={
            <ProtectedRoute>
              <VentasPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Reportes */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute allowedRoles={["GERENTE", "ADMIN"]}>
              <ReportesPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Auditoría (Solo Admin) */}
        <Route
          path="auditoria"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AuditoriaPage />
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
