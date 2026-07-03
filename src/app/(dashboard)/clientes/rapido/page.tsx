"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FloppyDisk,
  Tag,
  Percent,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { serviciosService } from "@/services/servicios.service";
import { promocionesService } from "@/services/promociones.service";
import { descuentosService } from "@/services/descuentos.service";
import { quickCheckoutService } from "@/services/quick-checkout.service";
import { formatCurrency, DPAGO_PLATAFORMAS } from "@/lib/constants";
import { toast } from "sonner";
import type { Servicio, Promocion, Descuento } from "@/types";

export default function ClienteRapidoPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(true);

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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoadingCatalogo(true);
      try {
        const [serviciosRes, promosRes, descRes] = await Promise.allSettled([
          serviciosService.getAll(),
          promocionesService.getAll(),
          descuentosService.getAll(),
        ]);

        if (serviciosRes.status === "fulfilled") {
          const activos = serviciosRes.value.data
            .filter((s) => s.estado)
            .sort((a, b) => a.id - b.id);
          setServicios(activos);
        }

        if (promosRes.status === "fulfilled") {
          const hoy = new Date().toISOString().split("T")[0];
          const activas = promosRes.value.data.filter(
            (p) => p.estado && p.fechaInicio <= hoy && p.fechaFin >= hoy
          );
          setPromociones(activas);
        }

        if (descRes.status === "fulfilled") {
          const activos = descRes.value.data.filter((d) => d.estado);
          setDescuentos(activos);
        }
      } catch {
        toast.error("Error al cargar datos");
      } finally {
        setLoadingCatalogo(false);
      }
    }

    fetchData();
  }, []);

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

  const resetForm = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nombre.trim()) {
      setError("Ingresá el nombre y apellido del cliente.");
      return;
    }
    if (!telefono.trim()) {
      setError("Ingresá el teléfono del cliente.");
      return;
    }
    if (selectedServicioIds.size === 0) {
      setError("Seleccioná al menos un servicio del catálogo. 'Otro' es un complemento.");
      return;
    }
    if (otroChecked && !otroTexto.trim()) {
      setError("Completá la descripción de 'Otro' o desmarcalo.");
      return;
    }
    if (!precioTotal.trim() || isNaN(montoBase) || montoBase <= 0) {
      setError("Ingresá un precio válido mayor a 0.");
      return;
    }
    if (tipoDescuento === "promocion" && !promocionId) {
      setError("Seleccioná una promoción.");
      return;
    }
    if (tipoDescuento === "descuento" && !descuentoId) {
      setError("Seleccioná un descuento.");
      return;
    }
    if (!metodoPago) {
      setError("Seleccioná un método de pago.");
      return;
    }
    if (metodoPago === "dpago" && !platformId) {
      setError("Seleccioná una plataforma de pago.");
      return;
    }

    const servicioIds = servicios
      .filter((s) => selectedServicioIds.has(s.id))
      .map((s) => s.id);

    setSubmitting(true);
    try {
      const res = await quickCheckoutService.create({
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
      });

      const { fidelidad } = res.data;
      const progresoMsg = fidelidad.incluyoCorteEnEsteTurno
        ? ` ${fidelidad.progreso}/${fidelidad.meta} cortes${fidelidad.completoEsteCiclo ? " 🎉 ¡Completó el ciclo!" : ""}`
        : "";
      toast.success(`Cliente y cobro registrados.${progresoMsg}`);
      resetForm();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al registrar. Intente nuevamente.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cliente + Cobro Rápido"
        description="Registrá al cliente, el servicio y el cobro en un solo paso"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/clientes">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Datos del Cliente</CardTitle>
            <CardDescription>
              Si ya existe un cliente con este teléfono, se reutiliza automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicio Realizado</CardTitle>
            <CardDescription>
              Marcá todos los servicios que se hicieron en esta visita.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precio y Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="space-y-4">
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
            </div>

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
          </CardContent>
        </Card>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          <FloppyDisk className="size-5" />
          {submitting
            ? "Guardando..."
            : `Guardar Cliente y Registrar Servicio${montoBase > 0 ? ` (${formatCurrency(montoFinal)})` : ""}`}
        </Button>
      </form>
    </div>
  );
}
