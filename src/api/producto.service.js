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
   */
  async createProducto(payload) {
    const { data } = await http.post("/nova-producto", payload);
    return data;
  },

  /**
   * Actualiza los datos base del producto (no variantes).
   */
  async updateProducto(id, payload) {
    const { data } = await http.put(`/nova-producto/${id}`, payload);
    return data;
  },

  /**
   * Desactiva un producto (borrado lógico).
   */
  async deleteProducto(id) {
    const { data } = await http.delete(`/nova-producto/${id}`);
    return data;
  },

  /**
   * Obtiene las variantes de un producto filtrando siempre por PRODU_PRODUCTO.
   * @param {number|string} productoId
   */
  async getVariantesByProducto(productoId) {
    const { data } = await http.get(`/nova-producto/${productoId}/variantes`);
    return data;
  },

  /**
   * Agrega una nueva variante a un producto existente (asociada a PRODU_PRODUCTO).
   * @param {number|string} productoId
   * @param {object} payload
   */
  async addVariante(productoId, payload) {
    const { data } = await http.post(`/nova-producto/${productoId}/variantes`, {
      ...payload,
      producto_id: productoId
    });
    return data;
  },

  /**
   * Modifica una variante existente filtrando siempre por PRODU_PRODUCTO.
   */
  async updateVariante(productoIdOrPayload, maybeVarianteId, maybeData) {
    let productoId = null;
    let varianteId = null;
    let dataPayload = null;

    if (typeof productoIdOrPayload === "object" && productoIdOrPayload !== null) {
      productoId = productoIdOrPayload.productoId || productoIdOrPayload.producto_id;
      varianteId = productoIdOrPayload.varianteId || productoIdOrPayload.variante_id;
      dataPayload = productoIdOrPayload.data || productoIdOrPayload;
    } else if (maybeData !== undefined) {
      productoId = productoIdOrPayload;
      varianteId = maybeVarianteId;
      dataPayload = maybeData;
    } else {
      varianteId = productoIdOrPayload;
      dataPayload = maybeVarianteId;
    }

    const url = productoId
      ? `/nova-producto/${productoId}/variantes/${varianteId}`
      : `/nova-producto/variante/${varianteId}`;

    const { data } = await http.put(url, {
      ...dataPayload,
      ...(productoId ? { producto_id: productoId } : {})
    });
    return data;
  },

  /**
   * Desactiva una variante filtrando siempre por PRODU_PRODUCTO.
   */
  async deleteVariante(productoIdOrVarianteId, maybeVarianteId) {
    let productoId = null;
    let varianteId = null;

    if (maybeVarianteId !== undefined) {
      productoId = productoIdOrVarianteId;
      varianteId = maybeVarianteId;
    } else if (typeof productoIdOrVarianteId === "object" && productoIdOrVarianteId !== null) {
      productoId = productoIdOrVarianteId.productoId || productoIdOrVarianteId.producto_id;
      varianteId = productoIdOrVarianteId.varianteId || productoIdOrVarianteId.variante_id;
    } else {
      varianteId = productoIdOrVarianteId;
    }

    const url = productoId
      ? `/nova-producto/${productoId}/variantes/${varianteId}`
      : `/nova-producto/variante/${varianteId}`;

    const { data } = await http.delete(url, {
      params: productoId ? { producto_id: productoId } : {}
    });
    return data;
  },
};
