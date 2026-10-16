import { http } from "./http";

export const compraService = {
  async getCompras() {
    const { data } = await http.get("/nova-compra");
    return data;
  },

  async getCompraById(id) {
    const { data } = await http.get(`/nova-compra/${id}`);
    return data;
  },

  async createCompra(payload) {
    const { data } = await http.post("/nova-compra", payload);
    return data;
  },

  async recibirCompra(id, almacenId = 1) {
    const { data } = await http.patch(`/nova-compra/${id}/recibir`, { almacen_id: almacenId });
    return data;
  },

  async cancelarCompra(id) {
    const { data } = await http.patch(`/nova-compra/${id}/cancelar`);
    return data;
  },
};
