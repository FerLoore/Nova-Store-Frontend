import { http } from "./http";

/**
 * Servicio de Autenticación
 */
export const authService = {
  /**
   * Inicia sesión en el sistema.
   * @param {{ usuario_email: string, usuario_password: string }} credentials
   * @returns {Promise<{ token: string, usuario: { usuario_id: number, usuario_nombre: string, usuario_email: string, rol_id: number, rol_nombre: string, permisos: string[] }, menu: Array<{ clave: string, etiqueta: string, ruta: string }> }>}
   */
  async login(credentials) {
    const { data } = await http.post("/auth/login", credentials);
    return data;
  },

  /**
   * Registra un nuevo usuario en el sistema.
   * @param {{ usuario_nombre: string, usuario_email: string, usuario_password: string, rol_id?: number }} payload
   * @returns {Promise<{ message: string, token: string, usuario: any, menu: any }>}
   */
  async register(payload) {
    const { data } = await http.post("/auth/register", payload);
    return data;
  },

  /**
   * Obtiene la lista de roles activos para registro público.
   */
  async getRoles() {
    const { data } = await http.get("/auth/roles");
    return data;
  },

  /**
   * Obtiene la sesión del usuario actual autenticado.
   * @returns {Promise<{ usuario: { usuario_id: number, usuario_nombre: string, usuario_email: string, rol_id: number, rol_nombre: string, permisos: string[] }, menu: Array<{ clave: string, etiqueta: string, ruta: string }> }>}
   */
  async me() {
    const { data } = await http.get("/auth/me");
    return data;
  },
};
