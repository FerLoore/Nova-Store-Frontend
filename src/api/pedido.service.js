import { http } from "./http";

/**
 * Servicio de Pedidos y Aprobaciones
 */
export const pedidoService = {
  /**
   * Obtiene la lista de pedidos con filtro opcional por estado.
   * @param {{ estado?: string, cliente_id?: number }} params
   */
  async getPedidos(params = {}) {
    const { data } = await http.get("/pedidos", { params });
    return data;
  },

  /**
   * Obtiene un pedido por su ID con relaciones completas.
   * @param {number|string} id
   */
  async getPedidoById(id) {
    const { data } = await http.get(`/pedidos/${id}`);
    return data;
  },

  /**
   * Crea un nuevo pedido.
   * Payload: { CLI_CLIENTE, PED_DESCUENTO, detalles: [{ VAR_VARIANTE, DETPED_CANTIDAD, DETPED_PRECIO_UNITARIO }] }
   */
  async createPedido(payload) {
    const { data } = await http.post("/pedidos", payload);
    return data;
  },

  /**
   * Aprueba un pedido pendiente (requiere rol GERENTE o ADMIN).
   * @param {number|string} id
   */
  async aprobarPedido(id) {
    const { data } = await http.put(`/pedidos/${id}/aprobar`);
    return data;
  },

  /**
   * Búsqueda de variantes activas para el buscador de pedidos.
   * @param {string} search
   */
  async getVariantes(search = "") {
    const params = search ? { search } : {};
    const { data } = await http.get("/nova-variante", { params });
    return data;
  },
};
