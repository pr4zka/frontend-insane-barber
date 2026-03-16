// ==========================================
// Insane Barber — TypeScript Types
// ==========================================

// --- Auth ---
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Usuario;
}

// --- Roles ---
export interface Rol {
  id: number;
  nombre: string;
}

export type RolNombre = "administrador" | "recepcionista" | "barbero";

// --- Usuarios ---
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password?: string;
  rolId: number;
  rol?: Rol;
  estado: boolean;
}

// --- Clientes ---
export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  fechaRegistro: string;
}

// --- Barberos ---
export interface Barbero {
  id: number;
  nombre: string;
  telefono: string;
  especialidad: string;
  estado: boolean;
  usuarioId: number | null;
}

// --- Servicios ---
export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMin: number;
  estado: boolean;
}

// --- Turnos ---
export type TurnoEstado = "pendiente" | "confirmado" | "cancelado" | "atendido" | "cobrado";

export interface Turno {
  id: number;
  clienteId: number;
  barberoId: number;
  servicioId: number;
  fecha: string;
  hora: string;
  estado: TurnoEstado;
  observacion: string;
  cliente?: Cliente;
  barbero?: Barbero;
  servicio?: Servicio;
  pago?: Pago;
}

// --- Notas de Remision de Venta ---
export interface NotaRemisionVenta {
  id: number;
  turnoId: number;
  fecha: string;
  observacion: string;
  turno?: Turno;
}

// --- Promociones ---
export interface Promocion {
  id: number;
  nombre: string;
  descripcion: string;
  porcentaje: number;
  fechaInicio: string;
  fechaFin: string;
  estado: boolean;
}

// --- Descuentos ---
export interface Descuento {
  id: number;
  nombre: string;
  descripcion: string;
  porcentaje: number;
  estado: boolean;
}

// --- Reclamos ---
export type ReclamoEstado = "pendiente" | "en_proceso" | "resuelto";

export interface Reclamo {
  id: number;
  clienteId: number;
  descripcion: string;
  fecha: string;
  estado: ReclamoEstado;
  cliente?: Cliente;
  seguimientos?: SeguimientoReclamo[];
}

export interface SeguimientoReclamo {
  id: number;
  reclamoId: number;
  comentario: string;
  estadoAnterior: string;
  estadoNuevo: string;
  fecha: string;
}

// --- Presupuestos ---
export type PresupuestoEstado = "borrador" | "enviado" | "aprobado" | "rechazado";

export interface Presupuesto {
  id: number;
  clienteId: number;
  fecha: string;
  total: number;
  estado: PresupuestoEstado;
  observacion: string;
  cliente?: Cliente;
  detalles?: DetallePresupuesto[];
}

export interface DetallePresupuesto {
  id: number;
  presupuestoId: number;
  servicioId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  servicio?: Servicio;
}

// --- Insumos ---
export interface Insumo {
  id: number;
  nombre: string;
  descripcion: string;
  unidad: string;
  stock: number;
  estado: boolean;
}

export interface InsumoUtilizado {
  id: number;
  turnoId: number;
  insumoId: number;
  cantidad: number;
  fecha: string;
  insumo?: Insumo;
  turno?: Turno;
}

// --- Caja ---
export type CajaEstado = "abierta" | "cerrada";

export interface Caja {
  id: number;
  usuarioId: number;
  fechaApertura: string;
  fechaCierre: string | null;
  montoInicial: number;
  montoFinal: number | null;
  estado: CajaEstado;
  usuario?: Usuario;
  movimientos?: MovimientoCaja[];
}

export interface MovimientoCaja {
  id: number;
  cajaId: number;
  tipo: "ingreso" | "egreso";
  concepto: string;
  monto: number;
  fecha: string;
}

// --- Pagos ---
export type MetodoPago = "efectivo" | "dpago";
export type PagoEstado = "completado" | "pendiente" | "rechazado";

export interface Pago {
  id: number;
  turnoId: number;
  metodoPago: MetodoPago;
  monto: number;
  montoOriginal: number | null;
  promocionId: number | null;
  descuentoId: number | null;
  porcentajeAplicado: number | null;
  dpagoRef: string | null;
  estado: PagoEstado;
  fecha: string;
  turno?: Turno;
  promocion?: Promocion;
  descuento?: Descuento;
}

// --- Notas de Crédito/Débito ---
export type NotaTipo = "credito" | "debito";
export type NotaEstado = "emitida" | "anulada";

export interface NotaCreditoDebito {
  id: number;
  pagoId: number;
  tipo: NotaTipo;
  monto: number;
  motivo: string;
  estado: NotaEstado;
  fecha: string;
  pago?: Pago;
}

// --- Libro de Ventas ---
export interface LibroVentas {
  id: number;
  pagoId: number;
  fecha: string;
  concepto: string;
  monto: number;
  metodoPago: string;
  pago?: Pago;
}

// --- Reportes ---
export interface ReporteIngreso {
  fecha: string;
  totalMonto: number;
  cantidadPagos: number;
}

export interface ReporteTurno {
  barberoNombre: string;
  total: number;
  atendidos: number;
  cancelados: number;
}

export interface ReporteServicio {
  servicioNombre: string;
  cantidadTurnos: number;
  ingresos: number;
}

// --- Compras ---
export interface Proveedor {
  id: number;
  nombre: string;
  ruc: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: boolean;
}

export type OrdenCompraEstado = "pendiente" | "aprobada" | "recibida" | "cancelada";

export interface OrdenCompra {
  id: number;
  proveedorId: number;
  fecha: string;
  estado: OrdenCompraEstado;
  total: number;
  observacion: string;
  proveedor?: Proveedor;
  detalles?: DetalleOrdenCompra[];
  libroCompras?: LibroCompras;
  notaRemision?: NotaRemision;
  notasCD?: NotaCDCompra[];
  ajustes?: AjusteCompra[];
}

export interface DetalleOrdenCompra {
  id: number;
  ordenCompraId: number;
  insumoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  insumo?: Insumo;
}

export interface LibroCompras {
  id: number;
  ordenCompraId: number;
  fecha: string;
  concepto: string;
  monto: number;
  proveedor: string;
  ordenCompra?: OrdenCompra;
}

export interface NotaRemision {
  id: number;
  ordenCompraId: number;
  fecha: string;
  observacion: string;
  ordenCompra?: OrdenCompra;
}

export interface NotaCDCompra {
  id: number;
  ordenCompraId: number;
  tipo: NotaTipo;
  monto: number;
  motivo: string;
  estado: NotaEstado;
  fecha: string;
  ordenCompra?: OrdenCompra;
}

// --- Ajustes de Compra ---
export interface AjusteCompra {
  id: number;
  ordenCompraId: number;
  tipo: string;
  descripcion: string;
  montoAnterior: number;
  montoNuevo: number;
  fecha: string;
  ordenCompra?: OrdenCompra;
}

// --- Recaudaciones ---
export interface Recaudacion {
  fecha: string;
  metodoPago: string;
  total: number;
  cantidadPagos: number;
}

// --- API Response ---
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
