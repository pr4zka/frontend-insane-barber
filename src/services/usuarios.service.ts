import api from "@/lib/api";
import type { Usuario } from "@/types";

export const usuariosService = {
  getAll: () => api.get<Usuario[]>("/users"),
  create: (data: Omit<Usuario, "id" | "rol"> & { password: string }) =>
    api.post<Usuario>("/users", data),
};
