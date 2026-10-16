import { http } from "./http";

/**
 * Servicio de Ventas y Pagos
 */
export const ventaService = {
  /**
   * Obtiene todas las ventas registradas.
   */
  async getVentas() {
    const { data } = await http.get("/nova-venta");
    return data;
  },

  /**
   * Obtiene una venta por ID con detalles y pagos.
   */
  async getVentaById(id) {
    const { data } = await http.get(`/nova-venta/${id}`);
    return data;
  },

  /**
   * Registra una nueva venta con salida de inventario y pago.
   * Valida stock previamente en backend.
   */
  async createVenta(payload) {
    const { data } = await http.post("/nova-venta", payload);
    return data;
  },
};
