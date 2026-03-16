import api from "@/lib/api";
import type { Reclamo, SeguimientoReclamo } from "@/types";

export const reclamosService = {
  getAll: () => api.get<Reclamo[]>("/complaints"),
  create: (data: Omit<Reclamo, "id" | "fecha" | "estado" | "cliente" | "seguimientos">) =>
    api.post<Reclamo>("/complaints", data),
  update: (id: number, data: Partial<Omit<Reclamo, "id" | "cliente" | "seguimientos">>) =>
    api.patch<Reclamo>(`/complaints/${id}`, data),
  getFollowUps: (id: number) =>
    api.get<SeguimientoReclamo[]>(`/complaints/${id}/follow-ups`),
  createFollowUp: (id: number, data: Omit<SeguimientoReclamo, "id" | "reclamoId" | "fecha">) =>
    api.post<SeguimientoReclamo>(`/complaints/${id}/follow-ups`, data),
};
