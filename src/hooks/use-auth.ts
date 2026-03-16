"use client";

import { create } from "zustand";
import type { Usuario, RolNombre } from "@/types";

interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
  hasRole: (roles: RolNombre[]) => boolean;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    set({ user, token, isAuthenticated: !!token, hydrated: true });
  },

  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasRole: (roles) => {
    const { user } = get();
    if (!user?.rol) return false;
    return roles.includes(user.rol.nombre as RolNombre);
  },
}));
