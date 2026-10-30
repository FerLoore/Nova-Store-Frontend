import { http } from "./http";

export const auditoriaService = {
  async getAuditorias() {
    const { data } = await http.get("/auditoria");
    return data;
  },
};
