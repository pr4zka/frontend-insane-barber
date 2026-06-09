import api from "@/lib/api";
import type {
  Proveedor,
  OrdenCompra,
  LibroCompras,
  NotaRemision,
  NotaCDCompra,
  AjusteCompra,
} from "@/types";

export const proveedoresService = {
  getAll: () => api.get<Proveedor[]>("/purchases/suppliers"),
  getById: (id: number) => api.get<Proveedor>(`/purchases/suppliers/${id}`),
  create: (data: Omit<Proveedor, "id">) =>
    api.post<Proveedor>("/purchases/suppliers", data),
  update: (id: number, data: Partial<Omit<Proveedor, "id">>) =>
    api.patch<Proveedor>(`/purchases/suppliers/${id}`, data),
};

export const ordenesCompraService = {
  getAll: () => api.get<OrdenCompra[]>("/purchases/orders"),
  getById: (id: number) => api.get<OrdenCompra>(`/purchases/orders/${id}`),
  create: (data: {
    proveedorId: number;
    observacion?: string;
    categoria?: string;
    detalle?: string;
    tipoComprobante?: string;
    nroComprobante?: string;
    timbrado?: string;
    condicion?: string;
    tasaIva?: number;
    detalles: { insumoId: number; cantidad: number; precioUnitario: number }[];
  }) => api.post<OrdenCompra>("/purchases/orders", data),
  approve: (id: number) =>
    api.patch<OrdenCompra>(`/purchases/orders/${id}/approve`, {}),
  cancel: (id: number) =>
    api.patch<OrdenCompra>(`/purchases/orders/${id}/cancel`, {}),
  receive: (id: number) =>
    api.patch<OrdenCompra>(`/purchases/orders/${id}/receive`, {}),
};

export const libroComprasService = {
  getAll: () => api.get<LibroCompras[]>("/purchases/ledger"),
  createExpense: (data: {
    proveedor: string;
    monto: number;
    categoria?: string;
    detalle?: string;
    fecha?: string;
    tipoComprobante?: string;
    nroComprobante?: string;
    timbrado?: string;
    condicion?: string;
    rucProveedor?: string;
    tasaIva?: number;
  }) => api.post<LibroCompras>("/purchases/ledger", data),
  update: (
    id: number,
    data: {
      categoria?: string;
      detalle?: string;
      tipoComprobante?: string;
      nroComprobante?: string;
      timbrado?: string;
      condicion?: string;
      rucProveedor?: string;
      tasaIva?: number;
    }
  ) => api.patch<LibroCompras>(`/purchases/ledger/${id}`, data),
};

export const notasRemisionService = {
  getAll: () => api.get<NotaRemision[]>("/purchases/delivery-notes"),
};

export const notasCDCompraService = {
  getAll: () => api.get<NotaCDCompra[]>("/purchases/notes"),
  create: (data: {
    ordenCompraId: number;
    tipo: string;
    monto: number;
    motivo: string;
  }) => api.post<NotaCDCompra>("/purchases/notes", data),
  annul: (id: number) =>
    api.patch<NotaCDCompra>(`/purchases/notes/${id}/annul`, {}),
};

export const ajustesCompraService = {
  getAll: () => api.get<AjusteCompra[]>("/purchases/adjustments"),
  create: (data: {
    ordenCompraId: number;
    tipo: string;
    descripcion: string;
    montoAnterior: number;
    montoNuevo: number;
  }) => api.post<AjusteCompra>("/purchases/adjustments", data),
};
