import api from "@/lib/api";
import type { Cliente } from "@/types";

export const clientesService = {
  getAll: () => api.get<Cliente[]>("/clients"),
  create: (data: Omit<Cliente, "id" | "fechaRegistro">) =>
    api.post<Cliente>("/clients", data),
  update: (id: number, data: Partial<Omit<Cliente, "id" | "fechaRegistro">>) =>
    api.patch<Cliente>(`/clients/${id}`, data),
};
