import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { authService } from "../api/auth.service";
import { tokenStorage } from "../api/tokenStorage";
import { registerUnauthorizedHandler } from "../api/http";

export const AuthContext = createContext(null);

const MODULOS = [
  "USUARIOS", "ROLES", "CLIENTES", "PRODUCTOS", "INVENTARIO",
  "COMPRAS", "PEDIDOS", "APROBACIONES", "VENTAS", "REPORTES", "AUDITORIA",
];

/** Garantiza que permisosModulo siempre tenga los 11 módulos. */
function normalizePermisosModulo(raw) {
  const mapa = {};
  for (const mod of MODULOS) mapa[mod] = "NINGUNO";
  if (raw && typeof raw === "object") {
    for (const mod of MODULOS) {
      if (raw[mod]) mapa[mod] = raw[mod];
    }
  }
  return mapa;
}

/** Construye el menú lateral desde el mapa módulo→nivel (oculta NINGUNO). */
function buildMenuFromModulos(permisosModulo) {
  const MENU_ITEMS = [
    { clave: "usuarios",     etiqueta: "Usuarios",         ruta: "/usuarios",             modulo: "USUARIOS" },
    { clave: "roles",        etiqueta: "Roles y Permisos", ruta: "/roles",                modulo: "ROLES" },
    { clave: "clientes",     etiqueta: "Clientes",         ruta: "/clientes",             modulo: "CLIENTES" },
    { clave: "productos",    etiqueta: "Productos",        ruta: "/productos",            modulo: "PRODUCTOS" },
    { clave: "marcas",       etiqueta: "Marcas",           ruta: "/marcas",               modulo: "PRODUCTOS" },
    { clave: "inventario",   etiqueta: "Inventario y Stock", ruta: "/inventario",         modulo: "INVENTARIO" },
    { clave: "proveedores",  etiqueta: "Proveedores",      ruta: "/proveedores",          modulo: "COMPRAS" },
    { clave: "compras",      etiqueta: "Compras",          ruta: "/compras",              modulo: "COMPRAS" },
    { clave: "pedidos",      etiqueta: "Nuevo Pedido",     ruta: "/pedidos",              modulo: "PEDIDOS" },
    { clave: "aprobaciones", etiqueta: "Aprobaciones",     ruta: "/pedidos/aprobaciones", modulo: "APROBACIONES" },
    { clave: "ventas",       etiqueta: "Ventas",           ruta: "/ventas",               modulo: "VENTAS" },
    { clave: "reportes",     etiqueta: "Reportes",         ruta: "/reportes",             modulo: "REPORTES" },
    { clave: "auditoria",    etiqueta: "Auditoría",        ruta: "/auditoria",            modulo: "AUDITORIA" },
  ];
  return MENU_ITEMS
    .filter((item) => (permisosModulo?.[item.modulo] ?? "NINGUNO") !== "NINGUNO")
    .map(({ clave, etiqueta, ruta }) => ({ clave, etiqueta, ruta }));
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [menu, setMenu] = useState([]);
  const [permisosModulo, setPermisosModulo] = useState({});
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    setUsuario(null);
    setMenu([]);
    setPermisosModulo({});
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
        const pm = normalizePermisosModulo(data.usuario?.permisosModulo);
        setUsuario(data.usuario);
        setPermisosModulo(pm);
        // Preferir menú del servidor; si viene vacío, construirlo desde módulos
        const serverMenu = data.menu && data.menu.length > 0
          ? data.menu
          : buildMenuFromModulos(pm);
        setMenu(serverMenu);
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
    const pm = normalizePermisosModulo(data.usuario?.permisosModulo);
    setUsuario(data.usuario);
    setPermisosModulo(pm);
    const serverMenu = data.menu && data.menu.length > 0
      ? data.menu
      : buildMenuFromModulos(pm);
    setMenu(serverMenu);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    if (data.token) {
      tokenStorage.setToken(data.token);
      const pm = normalizePermisosModulo(data.usuario?.permisosModulo);
      setUsuario(data.usuario);
      setPermisosModulo(pm);
      const serverMenu = data.menu && data.menu.length > 0
        ? data.menu
        : buildMenuFromModulos(pm);
      setMenu(serverMenu);
    }
    return data;
  }, []);

  /**
   * Devuelve true si el usuario tiene al menos nivelMinimo en el módulo.
   * ADMINISTRADOR (rol_id=1) siempre tiene acceso.
   * @param {string} modulo
   * @param {'LECTURA'|'ESCRITURA'} nivelMinimo
   */
  const puedeAcceder = useCallback(
    (modulo, nivelMinimo = "LECTURA") => {
      if (!usuario) return false;
      if (usuario.rol_id === 1) return true;
      const ORDEN = { NINGUNO: 0, LECTURA: 1, ESCRITURA: 2 };
      const nivelActual = permisosModulo?.[modulo] ?? "NINGUNO";
      return (ORDEN[nivelActual] ?? 0) >= (ORDEN[nivelMinimo] ?? 0);
    },
    [usuario, permisosModulo]
  );

  /**
   * @deprecated Usar puedeAcceder(modulo, nivel) en su lugar.
   * Conservado para compatibilidad con código existente.
   */
  const can = useCallback(
    (...codigos) => {
      if (!usuario) return false;
      if (usuario.rol_id === 1) return true;
      if (!Array.isArray(usuario.permisos)) return false;
      return codigos.some((c) => usuario.permisos.includes(c));
    },
    [usuario]
  );

  /** @deprecated Usar puedeAcceder() */
  const isGerenteOrAdmin = useMemo(() => {
    if (!usuario) return false;
    return usuario.rol_id === 1;
  }, [usuario]);

  const value = useMemo(
    () => ({
      usuario,
      menu,
      loading,
      permisosModulo,
      isAuthenticated: Boolean(usuario),
      isGerenteOrAdmin,
      puedeAcceder,
      login,
      register,
      logout,
      can,
    }),
    [usuario, menu, loading, permisosModulo, isGerenteOrAdmin, puedeAcceder, login, register, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
