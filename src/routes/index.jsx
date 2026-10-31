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
import { InventarioPage } from "../pages/InventarioPage";
import { ProveedoresPage } from "../pages/ProveedoresPage";
import { ComprasPage } from "../pages/ComprasPage";
import { NuevoPedidoPage } from "../pages/NuevoPedidoPage";
import { AprobacionesPage } from "../pages/AprobacionesPage";
import { VentasPage } from "../pages/VentasPage";
import { ReportesPage } from "../pages/ReportesPage";
import { AuditoriaPage } from "../pages/AuditoriaPage";
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
            <ProtectedRoute requiredModulo="USUARIOS">
              <UsuariosPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Roles y permisos */}
        <Route
          path="roles"
          element={
            <ProtectedRoute requiredModulo="ROLES">
              <RolesPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Clientes */}
        <Route
          path="clientes"
          element={
            <ProtectedRoute requiredModulo="CLIENTES">
              <ClientesPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Productos */}
        <Route
          path="productos"
          element={
            <ProtectedRoute requiredModulo="PRODUCTOS">
              <ProductosPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Inventario y Stock */}
        <Route
          path="inventario"
          element={
            <ProtectedRoute requiredModulo="INVENTARIO">
              <InventarioPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Proveedores (parte de COMPRAS) */}
        <Route
          path="proveedores"
          element={
            <ProtectedRoute requiredModulo="COMPRAS">
              <ProveedoresPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Compras */}
        <Route
          path="compras"
          element={
            <ProtectedRoute requiredModulo="COMPRAS">
              <ComprasPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Marcas (parte de PRODUCTOS) */}
        <Route
          path="marcas"
          element={
            <ProtectedRoute requiredModulo="PRODUCTOS">
              <MarcasPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Pedidos */}
        <Route
          path="pedidos"
          element={
            <ProtectedRoute requiredModulo="PEDIDOS">
              <NuevoPedidoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos/nuevo"
          element={
            <ProtectedRoute requiredModulo="PEDIDOS">
              <NuevoPedidoPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Aprobaciones */}
        <Route
          path="pedidos/aprobaciones"
          element={
            <ProtectedRoute requiredModulo="APROBACIONES">
              <AprobacionesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="aprobaciones"
          element={
            <ProtectedRoute requiredModulo="APROBACIONES">
              <AprobacionesPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Ventas */}
        <Route
          path="ventas"
          element={
            <ProtectedRoute requiredModulo="VENTAS">
              <VentasPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Reportes */}
        <Route
          path="reportes"
          element={
            <ProtectedRoute requiredModulo="REPORTES">
              <ReportesPage />
            </ProtectedRoute>
          }
        />

        {/* Módulo Auditoría */}
        <Route
          path="auditoria"
          element={
            <ProtectedRoute requiredModulo="AUDITORIA">
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
