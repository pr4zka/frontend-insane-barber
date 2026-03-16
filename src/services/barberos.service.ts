import api from "@/lib/api";
import type { Barbero } from "@/types";

export const barberosService = {
  getAll: () => api.get<Barbero[]>("/barbers"),
  create: (data: Omit<Barbero, "id">) =>
    api.post<Barbero>("/barbers", data),
};
