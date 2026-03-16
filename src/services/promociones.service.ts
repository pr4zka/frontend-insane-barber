import api from "@/lib/api";
import type { Promocion } from "@/types";

export const promocionesService = {
  getAll: () => api.get<Promocion[]>("/promotions"),
  create: (data: Omit<Promocion, "id">) =>
    api.post<Promocion>("/promotions", data),
  update: (id: number, data: Partial<Omit<Promocion, "id">>) =>
    api.patch<Promocion>(`/promotions/${id}`, data),
};
