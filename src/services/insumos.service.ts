import api from "@/lib/api";
import type { Insumo, InsumoUtilizado } from "@/types";

export const insumosService = {
  getAll: () => api.get<Insumo[]>("/supplies"),
  create: (data: Omit<Insumo, "id">) =>
    api.post<Insumo>("/supplies", data),
  update: (id: number, data: Partial<Omit<Insumo, "id">>) =>
    api.patch<Insumo>(`/supplies/${id}`, data),
  registerUsage: (data: Omit<InsumoUtilizado, "id" | "fecha" | "insumo" | "turno">) =>
    api.post<InsumoUtilizado>("/supplies/usage", data),
  getUsageByTurno: (turnoId: number) =>
    api.get<InsumoUtilizado[]>("/supplies/usage", { params: { turnoId } }),
};
