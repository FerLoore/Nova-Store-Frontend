import { http } from "./http";

export const ventaService = {
  async getVentas(params = {}) {
    const { data } = await http.get("/ventas", { params });
    return data;
  },
  async getVentaById(id) {
    const { data } = await http.get(`/ventas/${id}`);
    return data;
  },
};
