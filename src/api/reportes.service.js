import { http } from "./http";

export const reportesService = {
  async getVentas() {
    const { data } = await http.get("/reportes/ventas");
    return data;
  },
  async getTopProductos() {
    const { data } = await http.get("/reportes/top-productos");
    return data;
  },
};
