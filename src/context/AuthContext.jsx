import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { authService } from "../api/auth.service";
import { tokenStorage } from "../api/tokenStorage";
import { registerUnauthorizedHandler } from "../api/http";

export const AuthContext = createContext(null);

const ADMIN_DEFAULT_MENU = [
  { clave: "usuarios", etiqueta: "Usuarios", ruta: "/usuarios" },
  { clave: "roles", etiqueta: "Roles y Permisos", ruta: "/roles" },
  { clave: "clientes", etiqueta: "Clientes", ruta: "/clientes" },
  { clave: "proveedores", etiqueta: "Proveedores", ruta: "/proveedores" },
  { clave: "productos", etiqueta: "Productos", ruta: "/productos" },
  { clave: "inventario", etiqueta: "Inventario y Stock", ruta: "/inventario" },
  { clave: "compras", etiqueta: "Compras", ruta: "/compras" },
  { clave: "pedidos", etiqueta: "Nuevo Pedido", ruta: "/pedidos" },
  { clave: "aprobaciones", etiqueta: "Aprobaciones", ruta: "/pedidos/aprobaciones" },
  { clave: "ventas", etiqueta: "Ventas", ruta: "/ventas" },
  { clave: "reportes", etiqueta: "Reportes", ruta: "/reportes" },
  { clave: "auditoria", etiqueta: "Auditoría", ruta: "/auditoria" },
];

const resolveMenu = (user, serverMenu) => {
  const roleName = (user?.rol_nombre || "").toUpperCase();
  const esAdmin = roleName.includes("ADMIN") || user?.rol_id === 1 || user?.rol_id === 6;
  const esGerente = roleName.includes("GERENTE") || user?.rol_id === 5;

  if (esAdmin) {
    return ADMIN_DEFAULT_MENU;
  }

  const baseMenu = serverMenu && serverMenu.length > 0 ? [...serverMenu] : [];

  // Asegurar que siempre se muestre la opción de pedidos
  if (!baseMenu.some((m) => m.ruta === "/pedidos")) {
    baseMenu.push({ clave: "pedidos", etiqueta: "Nuevo Pedido", ruta: "/pedidos" });
  }

  // Asegurar ventas
  if (!baseMenu.some((m) => m.ruta === "/ventas")) {
    baseMenu.push({ clave: "ventas", etiqueta: "Ventas", ruta: "/ventas" });
  }

  // Asegurar compras, proveedores e inventario para admin y gerente
  if (esGerente || esAdmin) {
    if (!baseMenu.some((m) => m.ruta === "/proveedores")) {
      baseMenu.push({ clave: "proveedores", etiqueta: "Proveedores", ruta: "/proveedores" });
    }
    if (!baseMenu.some((m) => m.ruta === "/inventario")) {
      baseMenu.push({ clave: "inventario", etiqueta: "Inventario y Stock", ruta: "/inventario" });
    }
    if (!baseMenu.some((m) => m.ruta === "/compras")) {
      baseMenu.push({ clave: "compras", etiqueta: "Compras", ruta: "/compras" });
    }
  }

  // Si es gerente, asegurar acceso a aprobaciones y reportes
  if (esGerente) {
    if (!baseMenu.some((m) => m.ruta === "/pedidos/aprobaciones")) {
      baseMenu.push({ clave: "aprobaciones", etiqueta: "Aprobaciones", ruta: "/pedidos/aprobaciones" });
    }
    if (!baseMenu.some((m) => m.ruta === "/reportes")) {
      baseMenu.push({ clave: "reportes", etiqueta: "Reportes", ruta: "/reportes" });
    }
  }

  return baseMenu;
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    setUsuario(null);
    setMenu([]);
  }, []);

  // Registrar callback para que http.js cierre sesión ante 401
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  // Restaurar sesión al iniciar si hay token
  useEffect(() => {
    const restoreSession = async () => {
      const token = tokenStorage.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authService.me();
        setUsuario(data.usuario);
        setMenu(resolveMenu(data.usuario, data.menu));
      } catch (err) {
        console.warn("No se pudo restaurar la sesión:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [logout]);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    tokenStorage.setToken(data.token);
    setUsuario(data.usuario);
    setMenu(resolveMenu(data.usuario, data.menu));
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    if (data.token) {
      tokenStorage.setToken(data.token);
      setUsuario(data.usuario);
      setMenu(resolveMenu(data.usuario, data.menu));
    }
    return data;
  }, []);

  /**
   * Verifica si el usuario cuenta con al menos uno de los permisos dados.
   * Si el usuario es Administrador, siempre tiene permiso concedido.
   * @param  {...string} codigos
   * @returns {boolean}
   */
  const can = useCallback(
    (...codigos) => {
      if (!usuario) return false;
      const esAdmin =
        usuario.rol_nombre?.toUpperCase().includes("ADMIN") ||
        usuario.rol_id === 1;
      if (esAdmin) return true;
      if (!Array.isArray(usuario.permisos)) return false;
      return codigos.some((c) => usuario.permisos.includes(c));
    },
    [usuario]
  );

  const isGerenteOrAdmin = useMemo(() => {
    if (!usuario) return false;
    const r = (usuario.rol_nombre || "").toUpperCase();
    return r.includes("ADMIN") || r.includes("GERENTE") || usuario.rol_id === 1 || usuario.rol_id === 5 || usuario.rol_id === 6;
  }, [usuario]);

  const value = useMemo(
    () => ({
      usuario,
      menu,
      loading,
      isAuthenticated: Boolean(usuario),
      isGerenteOrAdmin,
      login,
      register,
      logout,
      can,
    }),
    [usuario, menu, loading, isGerenteOrAdmin, login, register, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
