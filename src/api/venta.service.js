import { http } from "./http";

/**
 * Servicio de Ventas y Facturación
 */
export const ventaService = {
  /**
   * Obtiene las ventas registradas con soporte de filtros (estado, cliente, fecha).
   */
  async getVentas(params = {}) {
    const { data } = await http.get("/ventas", { params });
    return data;
  },

  /**
   * Obtiene una venta por ID con detalles y pagos.
   */
  async getVentaById(id) {
    const { data } = await http.get(`/ventas/${id}`);
    return data;
  },

  /**
   * Registra una nueva venta directa con salida de inventario y pago.
   * Valida stock previamente en backend.
   */
  async createVenta(payload) {
    const { data } = await http.post("/nova-venta", payload);
    return data;
  },
};
