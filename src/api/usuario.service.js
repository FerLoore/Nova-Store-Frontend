import { http } from "./http";

/**
 * Servicio de Usuarios
 */
export const usuarioService = {
  /**
   * Obtiene todos los usuarios activos.
   * @returns {Promise<Array<{ usuario_id: number, usuario_nombre: string, usuario_email: string, rol_id: number, usuario_activo: number, usuario_creado?: string, rol?: { rol_id: number, rol_nombre: string } }>>}
   */
  async getUsuarios() {
    const { data } = await http.get("/nova-usuario");
    return data;
  },

  /**
   * Obtiene un usuario por ID.
   * @param {number|string} id
   */
  async getUsuarioById(id) {
    const { data } = await http.get(`/nova-usuario/${id}`);
    return data;
  },

  /**
   * Crea un nuevo usuario.
   * @param {{ rol_id: number, usuario_nombre: string, usuario_email: string, usuario_password: string }} payload
   */
  async createUsuario(payload) {
    const { data } = await http.post("/nova-usuario", payload);
    return data;
  },

  /**
   * Actualiza un usuario existente (parcial).
   * @param {number|string} id
   * @param {{ rol_id?: number, usuario_nombre?: string, usuario_email?: string, usuario_password?: string }} payload
   */
  async updateUsuario(id, payload) {
    const { data } = await http.put(`/nova-usuario/${id}`, payload);
    return data;
  },

  /**
   * Desactiva un usuario (borrado lógico).
   * @param {number|string} id
   */
  async deleteUsuario(id) {
    const { data } = await http.delete(`/nova-usuario/${id}`);
    return data;
  },
};
