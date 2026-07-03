import api from "@/lib/api";
import type { QuickCheckoutResult } from "@/types";

export interface CreateQuickCheckoutPayload {
  clienteNombre: string;
  clienteTelefono: string;
  clienteEmail?: string;
  servicioIds: number[];
  otroServicio?: string;
  precioTotal: number;
  metodoPago: "efectivo" | "dpago";
  platformId?: number;
  promocionId?: number;
  descuentoId?: number;
  fecha?: string;
  hora?: string;
}

export const quickCheckoutService = {
  create: (data: CreateQuickCheckoutPayload) =>
    api.post<QuickCheckoutResult>("/quick-checkout", data),
};
