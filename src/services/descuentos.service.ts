import api from "@/lib/api";
import type { Descuento } from "@/types";

export const descuentosService = {
  getAll: () => api.get<Descuento[]>("/discounts"),
  create: (data: Omit<Descuento, "id">) =>
    api.post<Descuento>("/discounts", data),
};
