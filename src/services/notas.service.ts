import api from "@/lib/api";
import type { NotaCreditoDebito } from "@/types";

export const notasService = {
  create: (data: Omit<NotaCreditoDebito, "id" | "fecha" | "estado" | "pago">) =>
    api.post<NotaCreditoDebito>("/credit-debit-notes", data),
  getAll: () => api.get<NotaCreditoDebito[]>("/credit-debit-notes"),
};
