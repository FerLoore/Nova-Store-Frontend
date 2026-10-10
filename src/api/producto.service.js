import { http } from "./http";

/**
 * Servicio de Productos y Variantes
 */
export const productoService = {
  /**
   * Obtiene todos los productos activos con sus variantes activas.
   * @returns {Promise<Array<any>>}
   */
  async getProductos() {
    const { data } = await http.get("/nova-producto");
    return data;
  },

  /**
   * Obtiene un producto activo por ID.
   * @param {number|string} id
   */
  async getProductoById(id) {
    const { data } = await http.get(`/nova-producto/${id}`);
    return data;
  },

  /**
   * Crea un producto con al menos 1 variante.
   * @param {{ categoria_id: number, marca_id: number, producto_nombre: string, producto_descripcion?: string, producto_genero: "HOMBRE"|"MUJER"|"UNISEX", producto_temporada?: string, variantes: Array<{ variante_talla: string, variante_color: string, variante_sku: string, variante_precio_compra?: number|null, variante_precio_venta: number, variante_stock_minimo?: number|null }> }} payload
   */
  async createProducto(payload) {
    const { data } = await http.post("/nova-producto", payload);
    return data;
  },

  /**
   * Actualiza los datos base del producto (no variantes).
   * @param {number|string} id
   * @param {{ producto_nombre?: string, producto_descripcion?: string, producto_genero?: string, producto_temporada?: string, categoria_id?: number, marca_id?: number }} payload
   */
  async updateProducto(id, payload) {
    const { data } = await http.put(`/nova-producto/${id}`, payload);
    return data;
  },

  /**
   * Desactiva un producto (borrado lógico).
   * @param {number|string} id
   */
  async deleteProducto(id) {
    const { data } = await http.delete(`/nova-producto/${id}`);
    return data;
  },

  /**
   * Agrega una nueva variante a un producto existente.
   * @param {number|string} productoId
   * @param {{ variante_talla: string, variante_color: string, variante_sku: string, variante_precio_compra?: number|null, variante_precio_venta: number, variante_stock_minimo?: number|null }} payload
   */
  async addVariante(productoId, payload) {
    const { data } = await http.post(`/nova-producto/${productoId}/variantes`, payload);
    return data;
  },

  /**
   * Modifica una variante existente.
   * @param {number|string} varianteId
   * @param {{ variante_talla?: string, variante_color?: string, variante_sku?: string, variante_precio_compra?: number|null, variante_precio_venta?: number, variante_stock_minimo?: number|null }} payload
   */
  async updateVariante(varianteId, payload) {
    const { data } = await http.put(`/nova-producto/variante/${varianteId}`, payload);
    return data;
  },

  /**
   * Desactiva una variante (borrado lógico).
   * @param {number|string} varianteId
   */
  async deleteVariante(varianteId) {
    const { data } = await http.delete(`/nova-producto/variante/${varianteId}`);
    return data;
  },
};
