import { http } from "./http";

export const proveedorService = {
  async getProveedores() {
    const { data } = await http.get("/nova-proveedor");
    return data;
  },

  async getProveedorById(id) {
    const { data } = await http.get(`/nova-proveedor/${id}`);
    return data;
  },

  async createProveedor(payload) {
    const { data } = await http.post("/nova-proveedor", payload);
    return data;
  },

  async updateProveedor(id, payload) {
    const { data } = await http.put(`/nova-proveedor/${id}`, payload);
    return data;
  },

  async deleteProveedor(id) {
    const { data } = await http.delete(`/nova-proveedor/${id}`);
    return data;
  },
};
