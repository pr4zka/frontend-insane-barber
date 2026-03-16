import api from "@/lib/api";
import type { LoginRequest, LoginResponse, Usuario } from "@/types";

export const authService = {
  login: (data: LoginRequest) => api.post<LoginResponse>("/auth/login", data),
  me: () => api.get<Usuario>("/auth/me"),
};
