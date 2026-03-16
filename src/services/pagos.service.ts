import api from "@/lib/api";
import type { Pago, NotaRemisionVenta } from "@/types";

export const pagosService = {
  getAll: () => api.get<Pago[]>("/payments"),
  create: (data: { turnoId: number; metodoPago: string; monto: number; promocionId?: number; descuentoId?: number }) =>
    api.post<Pago>("/payments", data),
  getReceipt: (id: number) =>
    api.get<Blob>(`/payments/${id}/receipt`, { responseType: "blob" }),
  getPending: () => api.get<Pago[]>("/payments/pending"),
  createDpago: (data: { turnoId: number; monto: number; platformId: number; promocionId?: number; descuentoId?: number }) =>
    api.post("/payments/dpago", data),
  createDpagoLink: (data: { turnoId: number; monto: number }) =>
    api.post("/payments/dpago/link", data),
  getDpagoStatus: (reference: string) =>
    api.get(`/payments/dpago/${reference}`),
  getDeliveryNotes: () => api.get<NotaRemisionVenta[]>("/payments/delivery-notes"),
  createDeliveryNote: (data: { turnoId: number; observacion?: string }) =>
    api.post<NotaRemisionVenta>("/payments/delivery-notes", data),
};
