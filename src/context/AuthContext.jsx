import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { authService } from "../api/auth.service";
import { tokenStorage } from "../api/tokenStorage";
import { registerUnauthorizedHandler } from "../api/http";

export const AuthContext = createContext(null);

const ADMIN_DEFAULT_MENU = [
  { clave: "usuarios", etiqueta: "Usuarios", ruta: "/usuarios" },
  { clave: "roles", etiqueta: "Roles y Permisos", ruta: "/roles" },
  { clave: "clientes", etiqueta: "Clientes", ruta: "/clientes" },
  { clave: "productos", etiqueta: "Productos", ruta: "/productos" },
];

const resolveMenu = (user, serverMenu) => {
  const esAdmin =
    user?.rol_nombre?.toUpperCase().includes("ADMIN") ||
    user?.rol_id === 1;

  if (esAdmin) {
    return ADMIN_DEFAULT_MENU;
  }
  return serverMenu || [];
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

  const value = useMemo(
    () => ({
      usuario,
      menu,
      loading,
      isAuthenticated: Boolean(usuario),
      login,
      logout,
      can,
    }),
    [usuario, menu, loading, login, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
