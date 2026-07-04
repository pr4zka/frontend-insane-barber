"use client";

import { useEffect, useMemo, useState } from "react";
import { CaretDown, CaretLeft, CaretRight, FloppyDisk, Tag, Percent, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { clientesService } from "@/services/clientes.service";
import { serviciosService } from "@/services/servicios.service";
import { promocionesService } from "@/services/promociones.service";
import { descuentosService } from "@/services/descuentos.service";
import { quickCheckoutService } from "@/services/quick-checkout.service";
import { formatCurrency, DPAGO_PLATAFORMAS, todayLocal } from "@/lib/constants";
import { toast } from "sonner";
import type { Servicio, Promocion, Descuento, Cliente } from "@/types";

const STEPS = [
  { key: "cliente", label: "Cliente" },
  { key: "servicio", label: "Servicio" },
  { key: "cobro", label: "Cobro" },
] as const;

function nowTimeStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Progreso del ciclo de fidelidad "4 cortes" a partir del contador acumulado
// que devuelve el backend (Cliente.cortesFidelidad). El beneficio (5to corte
// con promo) no se aplica solo — lo sigue eligiendo el barbero a mano en el
// paso de Cobro cuando corresponda.
function fidelidadLabel(cortesFidelidad: number): { text: string; listo: boolean } {
  const progreso = cortesFidelidad === 0 ? 0 : ((cortesFidelidad - 1) % 4) + 1;
  return {
    text: progreso === 4 ? "4/4 cortes — el próximo va con promo 🎉" : `${progreso}/4 cortes`,
    listo: progreso === 4,
  };
}

interface AtenderClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AtenderClienteDialog({ open, onOpenChange, onSuccess }: AtenderClienteDialogProps) {
  const [step, setStep] = useState(0);

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);

  const [clienteSearchOpen, setClienteSearchOpen] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");

  const [selectedServicioIds, setSelectedServicioIds] = useState<Set<number>>(new Set());
  const [otroChecked, setOtroChecked] = useState(false);
  const [otroTexto, setOtroTexto] = useState("");

  const [precioTotal, setPrecioTotal] = useState("");
  const [precioEditadoManual, setPrecioEditadoManual] = useState(false);

  const [tipoDescuento, setTipoDescuento] = useState<"ninguno" | "promocion" | "descuento">("ninguno");
  const [promocionId, setPromocionId] = useState("");
  const [descuentoId, setDescuentoId] = useState("");

  const [metodoPago, setMetodoPago] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [fecha, setFecha] = useState(todayLocal());
  const [hora, setHora] = useState(nowTimeStr());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoadingCatalogo(true);
      try {
        const [serviciosRes, promosRes, descRes, clientesRes] = await Promise.allSettled([
          serviciosService.getAll(),
          promocionesService.getAll(),
          descuentosService.getAll(),
          clientesService.getAll(),
        ]);

        if (serviciosRes.status === "fulfilled") {
          const activos = serviciosRes.value.data
            .filter((s) => s.estado)
            .sort((a, b) => a.id - b.id);
          setServicios(activos);
        }

        if (promosRes.status === "fulfilled") {
          const hoy = todayLocal();
          const activas = promosRes.value.data.filter(
            (p) => p.estado && p.fechaInicio <= hoy && p.fechaFin >= hoy
          );
          setPromociones(activas);
        }

        if (descRes.status === "fulfilled") {
          const activos = descRes.value.data.filter((d) => d.estado);
          setDescuentos(activos);
        }

        if (clientesRes.status === "fulfilled") {
          setClientes(clientesRes.value.data);
        }
      } catch {
        toast.error("Error al cargar datos");
      } finally {
        setLoadingCatalogo(false);
      }
    }

    fetchData();
  }, []);

  const resetForm = () => {
    setStep(0);
    setSelectedClienteId(null);
    setNombre("");
    setTelefono("");
    setEmail("");
    setSelectedServicioIds(new Set());
    setOtroChecked(false);
    setOtroTexto("");
    setPrecioTotal("");
    setPrecioEditadoManual(false);
    setTipoDescuento("ninguno");
    setPromocionId("");
    setDescuentoId("");
    setMetodoPago("");
    setPlatformId("");
    setFecha(todayLocal());
    setHora(nowTimeStr());
    setError("");
  };

  useEffect(() => {
    if (open) resetForm();
  }, [open]);

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedClienteId(cliente.id);
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono);
    setEmail(cliente.email ?? "");
    setClienteSearchOpen(false);
  };

  const handleClienteNuevo = () => {
    setSelectedClienteId(null);
    setNombre("");
    setTelefono("");
    setEmail("");
  };

  const toggleServicio = (id: number, checked: boolean) => {
    setSelectedServicioIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);

      if (!precioEditadoManual) {
        const suma = servicios
          .filter((s) => next.has(s.id))
          .reduce((sum, s) => sum + Number(s.precio), 0);
        setPrecioTotal(suma > 0 ? String(suma) : "");
      }

      return next;
    });
  };

  const selectedPromocion = useMemo(
    () => promociones.find((p) => p.id === Number(promocionId)),
    [promociones, promocionId]
  );
  const selectedDescuento = useMemo(
    () => descuentos.find((d) => d.id === Number(descuentoId)),
    [descuentos, descuentoId]
  );
  const selectedCliente = useMemo(
    () => clientes.find((c) => c.id === selectedClienteId),
    [clientes, selectedClienteId]
  );
  const clienteFidelidad = useMemo(
    () => fidelidadLabel(selectedCliente?.cortesFidelidad ?? 0),
    [selectedCliente]
  );

  const montoBase = Number(precioTotal) || 0;
  const seleccionado =
    tipoDescuento === "promocion"
      ? selectedPromocion
      : tipoDescuento === "descuento"
        ? selectedDescuento
        : null;
  const montoDescuento =
    !seleccionado || montoBase <= 0
      ? 0
      : seleccionado.tipo === "monto_fijo"
        ? Math.min(montoBase, Number(seleccionado.monto ?? 0))
        : Math.round(montoBase * (Number(seleccionado.porcentaje ?? 0) / 100));
  const montoFinal = montoBase - montoDescuento;

  const labelDescuento = (d: { tipo: string; porcentaje: number | null; monto: number | null }) =>
    d.tipo === "monto_fijo" ? formatCurrency(Number(d.monto ?? 0)) : `${d.porcentaje}%`;

  const handleTipoDescuentoChange = (value: string) => {
    setTipoDescuento(value as "ninguno" | "promocion" | "descuento");
    setPromocionId("");
    setDescuentoId("");
  };

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!nombre.trim()) return "Ingresá el nombre y apellido del cliente.";
      if (!telefono.trim()) return "Ingresá el teléfono del cliente.";
    }
    if (s === 1) {
      if (selectedServicioIds.size === 0)
        return "Seleccioná al menos un servicio del catálogo. 'Otro' es un complemento.";
      if (otroChecked && !otroTexto.trim()) return "Completá la descripción de 'Otro' o desmarcalo.";
      if (!precioTotal.trim() || isNaN(montoBase) || montoBase <= 0)
        return "Ingresá un precio válido mayor a 0.";
    }
    if (s === 2) {
      if (tipoDescuento === "promocion" && !promocionId) return "Seleccioná una promoción.";
      if (tipoDescuento === "descuento" && !descuentoId) return "Seleccioná un descuento.";
      if (!metodoPago) return "Seleccioná un método de pago.";
      if (metodoPago === "dpago" && !platformId) return "Seleccioná una plataforma de pago.";
      if (!fecha) return "Ingresá la fecha.";
      if (!hora) return "Ingresá la hora.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep(2);
    if (err) {
      setError(err);
      return;
    }
    setError("");

    const servicioIds = servicios
      .filter((s) => selectedServicioIds.has(s.id))
      .map((s) => s.id);

    setSubmitting(true);
    try {
      const res = await quickCheckoutService.create({
        clienteId: selectedClienteId ?? undefined,
        clienteNombre: nombre.trim(),
        clienteTelefono: telefono.trim(),
        clienteEmail: email.trim() || undefined,
        servicioIds,
        otroServicio: otroChecked ? otroTexto.trim() : undefined,
        precioTotal: montoBase,
        metodoPago: metodoPago as "efectivo" | "dpago",
        platformId: metodoPago === "dpago" ? Number(platformId) : undefined,
        promocionId: tipoDescuento === "promocion" ? Number(promocionId) : undefined,
        descuentoId: tipoDescuento === "descuento" ? Number(descuentoId) : undefined,
        fecha,
        hora,
      });

      const { fidelidad } = res.data;
      const progresoMsg = fidelidad.incluyoCorteEnEsteTurno
        ? ` ${fidelidad.progreso}/${fidelidad.meta} cortes${fidelidad.completoEsteCiclo ? " 🎉 ¡Completó el ciclo!" : ""}`
        : "";
      toast.success(`Cliente y cobro registrados.${progresoMsg}`);
      resetForm();
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al registrar. Intente nuevamente.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const progresoPct = ((step + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Atender Cliente</DialogTitle>
          <DialogDescription>
            Registrá al cliente, el servicio y el cobro en un solo paso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Paso {step + 1} de {STEPS.length}: {STEPS[step].label}
            </span>
            <span>{Math.round(progresoPct)}%</span>
          </div>
          <Progress value={progresoPct} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold">Datos del Cliente</h3>
                <p className="text-xs text-muted-foreground">
                  Buscá un cliente ya registrado o completá los datos para uno nuevo. Si editás
                  los datos de un cliente encontrado, se actualizan.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Buscar cliente existente</Label>
                <Popover open={clienteSearchOpen} onOpenChange={setClienteSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      <span className="truncate">
                        {selectedClienteId
                          ? clientes.find((c) => c.id === selectedClienteId)?.nombre
                          : "Nombre, teléfono o email..."}
                      </span>
                      <CaretDown className="size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[min(24rem,calc(100vw-3rem))] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar por nombre, teléfono o email..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron clientes.</CommandEmpty>
                        <CommandGroup>
                          {clientes.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={`${c.nombre} ${c.telefono} ${c.email ?? ""}`}
                              onSelect={() => handleSelectCliente(c)}
                            >
                              <div className="flex min-w-0 flex-col">
                                <span className="truncate">{c.nombre}</span>
                                <span className="truncate text-muted-foreground">
                                  {c.telefono}
                                  {c.email ? ` · ${c.email}` : ""}
                                  {` · ${fidelidadLabel(c.cortesFidelidad).text}`}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedClienteId && (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={
                        clienteFidelidad.listo
                          ? "text-xs font-medium text-emerald-600"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {clienteFidelidad.text}
                    </p>
                    <button
                      type="button"
                      onClick={handleClienteNuevo}
                      className="flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
                    >
                      <X className="size-3" />
                      Es un cliente nuevo / limpiar selección
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre y apellido *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Juan Perez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0981234567"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="juan@email.com"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold">Servicio Realizado</h3>
                <p className="text-xs text-muted-foreground">
                  Marcá todos los servicios que se hicieron en esta visita.
                </p>
              </div>
              <div className="space-y-3">
                {loadingCatalogo ? (
                  <p className="text-xs text-muted-foreground">Cargando catálogo...</p>
                ) : servicios.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No hay servicios activos en el catálogo.
                  </p>
                ) : (
                  servicios.map((servicio) => (
                    <div key={servicio.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`servicio-${servicio.id}`}
                        checked={selectedServicioIds.has(servicio.id)}
                        onCheckedChange={(checked) =>
                          toggleServicio(servicio.id, checked === true)
                        }
                      />
                      <Label htmlFor={`servicio-${servicio.id}`} className="font-normal">
                        {servicio.nombre} — {formatCurrency(Number(servicio.precio))}
                      </Label>
                    </div>
                  ))
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="servicio-otro"
                    checked={otroChecked}
                    onCheckedChange={(checked) => setOtroChecked(checked === true)}
                  />
                  <Label htmlFor="servicio-otro" className="font-normal">
                    Otro
                  </Label>
                </div>
                {otroChecked && (
                  <Input
                    value={otroTexto}
                    onChange={(e) => setOtroTexto(e.target.value)}
                    placeholder="Describí el servicio adicional"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  min="1"
                  placeholder="0"
                  value={precioTotal}
                  onChange={(e) => {
                    setPrecioTotal(e.target.value);
                    setPrecioEditadoManual(true);
                  }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold">Precio y Pago</h3>
              </div>

              <div className="space-y-2">
                <Label>Promoción o Descuento</Label>
                <Select value={tipoDescuento} onValueChange={handleTipoDescuentoChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguno">Sin descuento</SelectItem>
                    {promociones.length > 0 && (
                      <SelectItem value="promocion">Aplicar Promoción</SelectItem>
                    )}
                    {descuentos.length > 0 && (
                      <SelectItem value="descuento">Aplicar Descuento</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {tipoDescuento === "promocion" && (
                <div className="space-y-2">
                  <Label>Seleccionar Promoción</Label>
                  <Select value={promocionId} onValueChange={setPromocionId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione una promoción" />
                    </SelectTrigger>
                    <SelectContent>
                      {promociones.map((promo) => (
                        <SelectItem key={promo.id} value={String(promo.id)}>
                          <div className="flex items-center gap-2">
                            <Tag className="size-3.5" />
                            {promo.nombre} ({labelDescuento(promo)})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {tipoDescuento === "descuento" && (
                <div className="space-y-2">
                  <Label>Seleccionar Descuento</Label>
                  <Select value={descuentoId} onValueChange={setDescuentoId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione un descuento" />
                    </SelectTrigger>
                    <SelectContent>
                      {descuentos.map((desc) => (
                        <SelectItem key={desc.id} value={String(desc.id)}>
                          <div className="flex items-center gap-2">
                            <Percent className="size-3.5" />
                            {desc.nombre} ({labelDescuento(desc)})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {montoDescuento > 0 && montoBase > 0 && seleccionado && (
                <Card className="border-dashed bg-muted/50">
                  <CardContent className="space-y-2 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Precio original</span>
                      <span>{formatCurrency(montoBase)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-green-600">
                      <span>
                        {tipoDescuento === "promocion" ? "Promoción" : "Descuento"} ({labelDescuento(seleccionado)})
                      </span>
                      <span>-{formatCurrency(montoDescuento)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Total a cobrar</span>
                      <span className="text-sm font-semibold">{formatCurrency(montoFinal)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select
                  value={metodoPago}
                  onValueChange={(value) => {
                    setMetodoPago(value);
                    if (value !== "dpago") setPlatformId("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="dpago">Dpago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {metodoPago === "dpago" && (
                <div className="space-y-2">
                  <Label>Plataforma de Pago</Label>
                  <Select value={platformId} onValueChange={setPlatformId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      {DPAGO_PLATAFORMAS.map((plat) => (
                        <SelectItem key={plat.id} value={String(plat.id)}>
                          {plat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            {step === 0 && (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cerrar
              </Button>
            )}
            {step > 0 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={submitting}>
                <CaretLeft className="size-4" />
                Atrás
              </Button>
            )}
            {step < STEPS.length - 1 && (
              <Button type="button" onClick={handleNext}>
                Siguiente
                <CaretRight className="size-4" />
              </Button>
            )}
            {step === STEPS.length - 1 && (
              <Button type="submit" disabled={submitting}>
                <FloppyDisk className="size-4" />
                {submitting
                  ? "Guardando..."
                  : `Guardar${montoBase > 0 ? ` (${formatCurrency(montoFinal)})` : ""}`}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
