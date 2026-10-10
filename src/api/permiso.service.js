import { http } from "./http";

/**
 * Servicio de Permisos
 */
export const permisoService = {
  /**
   * Obtiene el catálogo completo de permisos del sistema.
   * @returns {Promise<Array<{ permiso_id: number, permiso_codigo: string, permiso_descripcion: string }>>}
   */
  async getPermisos() {
    const { data } = await http.get("/nova-permiso");
    return data;
  },

  /**
   * Obtiene los permisos asociados a un rol específico.
   * @param {number|string} rolId
   * @returns {Promise<Array<{ permiso_id: number, permiso_codigo: string, permiso_descripcion: string }>>}
   */
  async getPermisosByRol(rolId) {
    const { data } = await http.get(`/nova-permiso/rol/${rolId}`);
    return data;
  },

  /**
   * Reemplaza todos los permisos asignados a un rol.
   * @param {number|string} rolId
   * @param {{ permiso_ids: number[] }} payload
   */
  async setPermisosRol(rolId, payload) {
    const { data } = await http.put(`/nova-permiso/rol/${rolId}`, payload);
    return data;
  },
};
