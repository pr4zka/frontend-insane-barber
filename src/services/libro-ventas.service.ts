import api from "@/lib/api";
import type { LibroVentas } from "@/types";

export const libroVentasService = {
  getAll: (params?: {
    fecha_desde?: string;
    fecha_hasta?: string;
    metodo_pago?: string;
  }) => api.get<LibroVentas[]>("/sales-book", { params }),
};
