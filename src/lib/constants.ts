export const TURNO_ESTADOS = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  atendido: { label: "Atendido", color: "bg-green-100 text-green-800" },
  cobrado: { label: "Cobrado", color: "bg-emerald-100 text-emerald-800" },
} as const;

export const CAJA_ESTADOS = {
  abierta: { label: "Abierta", color: "bg-green-100 text-green-800" },
  cerrada: { label: "Cerrada", color: "bg-gray-100 text-gray-800" },
} as const;

export const RECLAMO_ESTADOS = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  en_proceso: { label: "En Proceso", color: "bg-blue-100 text-blue-800" },
  resuelto: { label: "Resuelto", color: "bg-green-100 text-green-800" },
} as const;

export const PRESUPUESTO_ESTADOS = {
  borrador: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
  enviado: { label: "Enviado", color: "bg-blue-100 text-blue-800" },
  aprobado: { label: "Aprobado", color: "bg-green-100 text-green-800" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-800" },
} as const;

export const NOTA_ESTADOS = {
  emitida: { label: "Emitida", color: "bg-blue-100 text-blue-800" },
  anulada: { label: "Anulada", color: "bg-red-100 text-red-800" },
} as const;

export const PAGO_ESTADOS = {
  completado: { label: "Completado", color: "bg-green-100 text-green-800" },
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-800" },
} as const;

export const METODOS_PAGO = {
  efectivo: "Efectivo",
  dpago: "Dpago",
} as const;

export const DPAGO_PLATAFORMAS = [
  { id: 1, nombre: "Tigo" },
  { id: 2, nombre: "Personal" },
  { id: 3, nombre: "Wally" },
  { id: 4, nombre: "Zimple" },
  { id: 5, nombre: "Tarjeta de crédito" },
  { id: 6, nombre: "QR" },
  { id: 7, nombre: "Transferencia bancaria" },
  { id: 8, nombre: "Infonet" },
  { id: 9, nombre: "Pago Express" },
] as const;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
