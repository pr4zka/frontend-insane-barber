import api from "@/lib/api";
import type { Caja, MovimientoCaja, Recaudacion } from "@/types";

export const cajaService = {
  open: (data: { montoInicial: number }) =>
    api.post<Caja>("/cash-register/open", data),
  close: (data: { montoFinal: number }) =>
    api.post<Caja>("/cash-register/close", data),
  getCurrent: () => api.get<Caja>("/cash-register/current"),
  getCollections: () => api.get<Recaudacion[]>("/cash-register/collections"),
  createMovement: (data: Omit<MovimientoCaja, "id" | "cajaId" | "fecha">) =>
    api.post<MovimientoCaja>("/cash-movements", data),
  getMovements: () => api.get<MovimientoCaja[]>("/cash-movements"),
};
