import { http } from "./http";

export const inventarioService = {
  /**
   * Endpoint de Inventario General: Cruce de NOVA_INVENTARIO, NOVA_VARIANTE, NOVA_PRODUCTO y NOVA_ALMACEN
   */
  async getInventarioGeneral() {
    const { data } = await http.get("/nova-inventario/general");
    return data;
  },

  /**
   * Endpoint de Alertas: Filtra donde INV_CANTIDAD <= VAR_STOCK_MINIMO
   */
  async getAlertasInventario() {
    const { data } = await http.get("/nova-inventario/alertas");
    return data;
  },
};
