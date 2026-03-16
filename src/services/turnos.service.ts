import api from "@/lib/api";
import type { Turno } from "@/types";

export const turnosService = {
  getAll: () => api.get<Turno[]>("/appointments"),
  create: (data: Omit<Turno, "id" | "estado" | "cliente" | "barbero" | "servicio" | "pago">) =>
    api.post<Turno>("/appointments", data),
  update: (id: number, data: Partial<Omit<Turno, "id" | "cliente" | "barbero" | "servicio" | "pago">>) =>
    api.patch<Turno>(`/appointments/${id}`, data),
  confirm: (id: number) =>
    api.patch<Turno>(`/appointments/${id}/confirm`),
  cancel: (id: number) =>
    api.patch<Turno>(`/appointments/${id}/cancel`),
  reschedule: (id: number, data: { fecha: string; hora: string }) =>
    api.patch<Turno>(`/appointments/${id}/reschedule`, data),
};
