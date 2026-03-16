import api from "@/lib/api";
import type { Servicio } from "@/types";

export const serviciosService = {
  getAll: () => api.get<Servicio[]>("/services"),
  create: (data: Omit<Servicio, "id">) =>
    api.post<Servicio>("/services", data),
  update: (id: number, data: Partial<Omit<Servicio, "id">>) =>
    api.patch<Servicio>(`/services/${id}`, data),
  delete: (id: number) => api.delete(`/services/${id}`),
};
