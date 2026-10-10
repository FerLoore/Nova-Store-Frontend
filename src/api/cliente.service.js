import { http } from "./http";

/**
 * Servicio de Clientes
 */
export const clienteService = {
  /**
   * Obtiene todos los clientes activos.
   * @returns {Promise<Array<{ cliente_id: number, cliente_nombre: string, cliente_dpi_nit: string|null, cliente_telefono: string|null, cliente_correo: string|null, cliente_direccion: string|null, cliente_activo: number }>>}
   */
  async getClientes() {
    const { data } = await http.get("/nova-cliente");
    return data;
  },

  /**
   * Obtiene un cliente por ID.
   * @param {number|string} id
   */
  async getClienteById(id) {
    const { data } = await http.get(`/nova-cliente/${id}`);
    return data;
  },

  /**
   * Crea un nuevo cliente.
   * @param {{ cliente_nombre: string, cliente_dpi_nit?: string, cliente_telefono?: string, cliente_correo?: string, cliente_direccion?: string }} payload
   */
  async createCliente(payload) {
    const { data } = await http.post("/nova-cliente", payload);
    return data;
  },

  /**
   * Actualiza un cliente existente.
   * @param {number|string} id
   * @param {{ cliente_nombre?: string, cliente_dpi_nit?: string, cliente_telefono?: string, cliente_correo?: string, cliente_direccion?: string }} payload
   */
  async updateCliente(id, payload) {
    const { data } = await http.put(`/nova-cliente/${id}`, payload);
    return data;
  },

  /**
   * Desactiva un cliente (borrado lógico).
   * @param {number|string} id
   */
  async deleteCliente(id) {
    const { data } = await http.delete(`/nova-cliente/${id}`);
    return data;
  },
};
