import api from "@/lib/api";
import type { Presupuesto } from "@/types";

export const presupuestosService = {
  getAll: () => api.get<Presupuesto[]>("/budgets"),
  create: (data: Omit<Presupuesto, "id" | "fecha" | "total" | "cliente" | "detalles"> & {
    detalles: { servicioId: number; cantidad: number; precioUnitario: number }[];
  }) => api.post<Presupuesto>("/budgets", data),
  getById: (id: number) => api.get<Presupuesto>(`/budgets/${id}`),
  getPdf: (id: number) =>
    api.get<Blob>(`/budgets/${id}/pdf`, { responseType: "blob" }),
};
