import { http } from "./http";

/**
 * Servicio de Categorías
 */
export const categoriaService = {
  /**
   * Obtiene todas las categorías activas.
   * @returns {Promise<Array<{ categoria_id: number, categoria_nombre: string, categoria_descripcion: string|null }>>}
   */
  async getCategorias() {
    const { data } = await http.get("/nova-categoria");
    return data;
  },

  /**
   * Crea una nueva categoría.
   * @param {{ categoria_nombre: string, categoria_descripcion?: string }} payload
   */
  async createCategoria(payload) {
    const { data } = await http.post("/nova-categoria", payload);
    return data;
  },
};
