import { http } from "./http";

/**
 * Servicio de Roles
 */
export const rolService = {
  /**
   * Obtiene todos los roles activos.
   * @returns {Promise<Array<{ rol_id: number, rol_nombre: string, rol_descripcion: string|null, rol_activo: number }>>}
   */
  async getRoles() {
    const { data } = await http.get("/nova-rol");
    return data;
  },

  /**
   * Obtiene un rol por ID.
   * @param {number|string} id
   */
  async getRolById(id) {
    const { data } = await http.get(`/nova-rol/${id}`);
    return data;
  },

  /**
   * Crea un nuevo rol.
   * @param {{ rol_nombre: string, rol_descripcion?: string }} payload
   */
  async createRol(payload) {
    const { data } = await http.post("/nova-rol", payload);
    return data;
  },

  /**
   * Actualiza un rol existente.
   * @param {number|string} id
   * @param {{ rol_nombre?: string, rol_descripcion?: string }} payload
   */
  async updateRol(id, payload) {
    const { data } = await http.put(`/nova-rol/${id}`, payload);
    return data;
  },

  /**
   * Desactiva un rol (borrado lógico).
   * @param {number|string} id
   */
  async deleteRol(id) {
    const { data } = await http.delete(`/nova-rol/${id}`);
    return data;
  },
};
