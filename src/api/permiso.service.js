import { http } from "./http";

/**
 * Servicio de Permisos
 */
export const permisoService = {
  // ── Endpoints legados (catálogo atómico) ─────────────────────────────────

  /**
   * Obtiene el catálogo completo de permisos atómicos del sistema.
   * @returns {Promise<Array<{ permiso_id: number, permiso_codigo: string, permiso_descripcion: string }>>}
   */
  async getPermisos() {
    const { data } = await http.get("/nova-permiso");
    return data;
  },

  /**
   * Obtiene los permisos atómicos asociados a un rol específico (legado).
   * @param {number|string} rolId
   */
  async getPermisosByRol(rolId) {
    const { data } = await http.get(`/nova-permiso/rol/${rolId}`);
    return data;
  },

  /**
   * Reemplaza todos los permisos atómicos asignados a un rol (legado).
   * @param {number|string} rolId
   * @param {{ permiso_ids: number[] }} payload
   */
  async setPermisosRol(rolId, payload) {
    const { data } = await http.put(`/nova-permiso/rol/${rolId}`, payload);
    return data;
  },

  // ── Nuevos endpoints por módulo ──────────────────────────────────────────

  /**
   * Obtiene el mapa módulo→nivel para un rol.
   * @param {number|string} rolId
   * @returns {Promise<Record<string, 'NINGUNO'|'LECTURA'|'ESCRITURA'>>}
   */
  async getPermisosModulo(rolId) {
    const { data } = await http.get(`/nova-permiso/rol/${rolId}/modulos`);
    return data;
  },

  /**
   * Guarda el mapa módulo→nivel para un rol (upsert de los 11 módulos).
   * @param {number|string} rolId
   * @param {Record<string, 'NINGUNO'|'LECTURA'|'ESCRITURA'>} modulos
   */
  async setPermisosModulo(rolId, modulos) {
    const { data } = await http.put(`/nova-permiso/rol/${rolId}/modulos`, { modulos });
    return data;
  },
};
