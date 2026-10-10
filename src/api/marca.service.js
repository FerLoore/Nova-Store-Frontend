import { http } from "./http";

/**
 * Servicio de Marcas
 */
export const marcaService = {
  /**
   * Obtiene todas las marcas activas.
   * @returns {Promise<Array<{ marca_id: number, marca_nombre: string, marca_descripcion: string|null, marca_activo: number }>>}
   */
  async getMarcas() {
    const { data } = await http.get("/nova-marca");
    return data;
  },

  /**
   * Obtiene una marca por ID.
   * @param {number|string} id
   */
  async getMarcaById(id) {
    const { data } = await http.get(`/nova-marca/${id}`);
    return data;
  },

  /**
   * Crea una nueva marca.
   * @param {{ marca_nombre: string, marca_descripcion?: string }} payload
   */
  async createMarca(payload) {
    const { data } = await http.post("/nova-marca", payload);
    return data;
  },

  /**
   * Actualiza una marca existente.
   * @param {number|string} id
   * @param {{ marca_nombre?: string, marca_descripcion?: string }} payload
   */
  async updateMarca(id, payload) {
    const { data } = await http.put(`/nova-marca/${id}`, payload);
    return data;
  },

  /**
   * Desactiva una marca (borrado lógico).
   * @param {number|string} id
   */
  async deleteMarca(id) {
    const { data } = await http.delete(`/nova-marca/${id}`);
    return data;
  },
};
