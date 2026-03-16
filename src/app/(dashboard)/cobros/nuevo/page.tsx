"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CurrencyCircleDollar, Tag, Percent } from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { turnosService } from "@/services/turnos.service";
import { pagosService } from "@/services/pagos.service";
import { promocionesService } from "@/services/promociones.service";
import { descuentosService } from "@/services/descuentos.service";
import { formatCurrency, DPAGO_PLATAFORMAS } from "@/lib/constants";
import { toast } from "sonner";
import type { Turno, Promocion, Descuento } from "@/types";

export default function NuevoCobroPage() {
  const router = useRouter();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(true);
  const [turnoId, setTurnoId] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [monto, setMonto] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState<"ninguno" | "promocion" | "descuento">("ninguno");
  const [promocionId, setPromocionId] = useState("");
  const [descuentoId, setDescuentoId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoadingTurnos(true);
      try {
        const [turnosRes, promosRes, descRes] = await Promise.allSettled([
          turnosService.getAll(),
          promocionesService.getAll(),
          descuentosService.getAll(),
        ]);

        if (turnosRes.status === "fulfilled") {
          const atendidos = turnosRes.value.data.filter((t) => t.estado === "atendido");
          setTurnos(atendidos);
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
        setLoadingTurnos(false);
      }
    }

    fetchData();
  }, []);

  const selectedTurno = useMemo(() => turnos.find((t) => t.id === Number(turnoId)), [turnos, turnoId]);
  const selectedPromocion = useMemo(() => promociones.find((p) => p.id === Number(promocionId)), [promociones, promocionId]);
  const selectedDescuento = useMemo(() => descuentos.find((d) => d.id === Number(descuentoId)), [descuentos, descuentoId]);

  const montoBase = Number(monto) || 0;
  const porcentaje =
    tipoDescuento === "promocion" && selectedPromocion
      ? Number(selectedPromocion.porcentaje)
      : tipoDescuento === "descuento" && selectedDescuento
        ? Number(selectedDescuento.porcentaje)
        : 0;
  const montoDescuento = Math.round(montoBase * (porcentaje / 100));
  const montoFinal = montoBase - montoDescuento;

  const handleTurnoChange = (value: string) => {
    setTurnoId(value);
    const turno = turnos.find((t) => t.id === Number(value));
    if (turno?.servicio?.precio) {
      setMonto(String(turno.servicio.precio));
    } else {
      setMonto("");
    }
  };

  const handleTipoDescuentoChange = (value: string) => {
    setTipoDescuento(value as "ninguno" | "promocion" | "descuento");
    setPromocionId("");
    setDescuentoId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!turnoId) {
      setError("Seleccione un turno.");
      return;
    }
    if (!metodoPago) {
      setError("Seleccione un metodo de pago.");
      return;
    }
    if (metodoPago === "dpago" && !platformId) {
      setError("Seleccione una plataforma de pago.");
      return;
    }
    if (!monto.trim() || isNaN(montoBase) || montoBase <= 0) {
      setError("Ingrese un monto valido mayor a 0.");
      return;
    }
    if (tipoDescuento === "promocion" && !promocionId) {
      setError("Seleccione una promoción.");
      return;
    }
    if (tipoDescuento === "descuento" && !descuentoId) {
      setError("Seleccione un descuento.");
      return;
    }

    setSubmitting(true);
    try {
      const payloadBase = {
        turnoId: Number(turnoId),
        monto: montoBase,
        promocionId: tipoDescuento === "promocion" ? Number(promocionId) : undefined,
        descuentoId: tipoDescuento === "descuento" ? Number(descuentoId) : undefined,
      };

      if (metodoPago === "efectivo") {
        await pagosService.create({
          ...payloadBase,
          metodoPago: "efectivo",
        });
      } else {
        await pagosService.createDpago({
          ...payloadBase,
          platformId: Number(platformId),
        });
      }
      toast.success("Cobro registrado exitosamente");
      router.push("/cobros");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || "Error al registrar el cobro. Intente nuevamente.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Cobro"
        description="Registre el pago de un turno atendido"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/cobros">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos del Cobro</CardTitle>
          <CardDescription>
            Seleccione el turno y el metodo de pago
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Turno */}
            <div className="space-y-2">
              <Label>Turno</Label>
              {loadingTurnos ? (
                <p className="text-xs text-muted-foreground">
                  Cargando turnos...
                </p>
              ) : turnos.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No hay turnos atendidos pendientes de cobro.
                </p>
              ) : (
                <Select value={turnoId} onValueChange={handleTurnoChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {turnos.map((turno) => (
                      <SelectItem key={turno.id} value={String(turno.id)}>
                        {turno.cliente?.nombre ?? "Sin cliente"} -{" "}
                        {turno.servicio?.nombre ?? "Sin servicio"} -{" "}
                        {turno.servicio?.precio
                          ? formatCurrency(turno.servicio.precio)
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Turno Preview */}
            {selectedTurno && (
              <Card>
                <CardContent className="space-y-2 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Cliente
                    </span>
                    <span className="text-xs font-medium">
                      {selectedTurno.cliente?.nombre ?? "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Servicio
                    </span>
                    <span className="text-xs font-medium">
                      {selectedTurno.servicio?.nombre ?? "-"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Monto</span>
                    <span className="text-sm font-semibold">
                      {selectedTurno.servicio?.precio
                        ? formatCurrency(selectedTurno.servicio.precio)
                        : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Promoción / Descuento */}
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
                      <SelectItem value="promocion">
                        Aplicar Promoción
                      </SelectItem>
                    )}
                    {descuentos.length > 0 && (
                      <SelectItem value="descuento">
                        Aplicar Descuento
                      </SelectItem>
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
                            {promo.nombre} ({promo.porcentaje}%)
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
                            {desc.nombre} ({desc.porcentaje}%)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Resumen del descuento */}
              {porcentaje > 0 && montoBase > 0 && (
                <Card className="border-dashed bg-muted/50">
                  <CardContent className="space-y-2 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Monto original</span>
                      <span>{formatCurrency(montoBase)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-green-600">
                      <span>
                        {tipoDescuento === "promocion" ? "Promoción" : "Descuento"} ({porcentaje}%)
                      </span>
                      <span>-{formatCurrency(montoDescuento)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Monto final</span>
                      <span className="text-sm font-semibold">{formatCurrency(montoFinal)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Metodo de Pago */}
            <div className="space-y-2">
              <Label>Metodo de Pago</Label>
              <Select
                value={metodoPago}
                onValueChange={(value) => {
                  setMetodoPago(value);
                  if (value !== "dpago") {
                    setPlatformId("");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione metodo de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="dpago">Dpago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dpago Platform */}
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

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                min="1"
                placeholder="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/cobros")}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || turnos.length === 0}>
                <CurrencyCircleDollar className="size-4" />
                {submitting ? "Registrando..." : `Registrar Cobro${porcentaje > 0 ? ` (${formatCurrency(montoFinal)})` : ""}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
