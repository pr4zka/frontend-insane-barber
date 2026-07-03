import api from "@/lib/api";
import type { Cliente } from "@/types";

type ClientePayload = Omit<Cliente, "id" | "fechaRegistro" | "cortesFidelidad">;

export const clientesService = {
  getAll: () => api.get<Cliente[]>("/clients"),
  create: (data: ClientePayload) => api.post<Cliente>("/clients", data),
  update: (id: number, data: Partial<ClientePayload>) =>
    api.patch<Cliente>(`/clients/${id}`, data),
};
