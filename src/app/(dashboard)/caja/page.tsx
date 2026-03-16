"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CashRegister,
  Plus,
  LockSimple,
  ArrowUp,
  ArrowDown,
} from "@phosphor-icons/react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, CAJA_ESTADOS } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { cajaService } from "@/services/caja.service";
import { formatCurrency, formatDateTime } from "@/lib/constants";
import { toast } from "sonner";
import type { Caja, MovimientoCaja } from "@/types";

interface MovimientoForm {
  tipo: string;
  concepto: string;
  monto: string;
}

const INITIAL_MOV_FORM: MovimientoForm = {
  tipo: "",
  concepto: "",
  monto: "",
};

interface CierreSummary {
  montoInicial: number;
  montoFinal: number;
  diferencia: number;
}

export default function CajaPage() {
  const [caja, setCaja] = useState<Caja | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [loading, setLoading] = useState(true);
  const [montoInicial, setMontoInicial] = useState("");
  const [montoFinal, setMontoFinal] = useState("");
  const [openingCaja, setOpeningCaja] = useState(false);
  const [closingCaja, setClosingCaja] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  const [movForm, setMovForm] = useState<MovimientoForm>(INITIAL_MOV_FORM);
  const [submittingMov, setSubmittingMov] = useState(false);
  const [error, setError] = useState("");
  const [cierreSummary, setCierreSummary] = useState<CierreSummary | null>(null);

  const fetchCaja = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cajaService.getCurrent();
      setCaja(res.data);
    } catch {
      setCaja(null);
      toast.error("Error al cargar datos de caja");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMovimientos = useCallback(async () => {
    try {
      const res = await cajaService.getMovements();
      setMovimientos(res.data);
    } catch {
      setMovimientos([]);
      toast.error("Error al cargar movimientos");
    }
  }, []);

  useEffect(() => {
    fetchCaja();
  }, [fetchCaja]);

  useEffect(() => {
    if (caja && caja.estado === "abierta") {
      fetchMovimientos();
    }
  }, [caja, fetchMovimientos]);

  const handleOpenCaja = async () => {
    setError("");
    const monto = Number(montoInicial);
    if (!montoInicial.trim() || isNaN(monto) || monto < 0) {
      setError("Ingrese un monto inicial valido.");
      return;
    }

    setOpeningCaja(true);
    try {
      const res = await cajaService.open({ montoInicial: monto });
      setCaja(res.data);
      setMontoInicial("");
      setCierreSummary(null);
    } catch {
      setError("Error al abrir la caja. Intente nuevamente.");
      toast.error("Error al abrir caja");
    } finally {
      setOpeningCaja(false);
    }
  };

  const handleCloseCaja = async () => {
    setError("");
    const monto = Number(montoFinal);
    if (!montoFinal.trim() || isNaN(monto) || monto < 0) {
      setError("Ingrese un monto final valido.");
      setConfirmCloseOpen(false);
      return;
    }

    setClosingCaja(true);
    try {
      await cajaService.close({ montoFinal: monto });
      setCierreSummary({
        montoInicial: caja?.montoInicial ?? 0,
        montoFinal: monto,
        diferencia: monto - (caja?.montoInicial ?? 0),
      });
      setCaja(null);
      setMontoFinal("");
      setMovimientos([]);
    } catch {
      setError("Error al cerrar la caja. Intente nuevamente.");
      toast.error("Error al cerrar caja");
    } finally {
      setClosingCaja(false);
      setConfirmCloseOpen(false);
    }
  };

  const handleOpenMovDialog = () => {
    setMovForm(INITIAL_MOV_FORM);
    setError("");
    setMovDialogOpen(true);
  };

  const handleSubmitMovimiento = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!movForm.tipo) {
      setError("Seleccione el tipo de movimiento.");
      return;
    }
    if (!movForm.concepto.trim()) {
      setError("Ingrese el concepto del movimiento.");
      return;
    }
    const monto = Number(movForm.monto);
    if (!movForm.monto.trim() || isNaN(monto) || monto <= 0) {
      setError("Ingrese un monto valido mayor a 0.");
      return;
    }

    setSubmittingMov(true);
    try {
      await cajaService.createMovement({
        tipo: movForm.tipo as "ingreso" | "egreso",
        concepto: movForm.concepto.trim(),
        monto,
      });
      setMovDialogOpen(false);
      fetchMovimientos();
    } catch {
      setError("Error al registrar el movimiento. Intente nuevamente.");
      toast.error("Error al registrar movimiento");
    } finally {
      setSubmittingMov(false);
    }
  };

  const movimientoColumns: DataTableColumn<MovimientoCaja>[] = [
    {
      key: "tipo",
      header: "Tipo",
      render: (mov) =>
        mov.tipo === "ingreso" ? (
          <Badge
            variant="outline"
            className="border-transparent bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <ArrowUp className="mr-1 size-3" />
            Ingreso
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-transparent bg-red-500/10 text-red-700 dark:text-red-400"
          >
            <ArrowDown className="mr-1 size-3" />
            Egreso
          </Badge>
        ),
    },
    {
      key: "concepto",
      header: "Concepto",
    },
    {
      key: "monto",
      header: "Monto",
      render: (mov) => formatCurrency(mov.monto),
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (mov) => formatDateTime(mov.fecha),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Caja" />
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-xs text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caja"
        description="Gestion de apertura, cierre y movimientos de caja"
      />

      {/* Cierre Summary */}
      {cierreSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen de Cierre</CardTitle>
            <CardDescription>
              La caja fue cerrada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Monto Inicial
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(cierreSummary.montoInicial)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Monto Final Contado
              </span>
              <span className="text-sm font-medium">
                {formatCurrency(cierreSummary.montoFinal)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Diferencia</span>
              <span
                className={`text-sm font-semibold ${
                  cierreSummary.diferencia >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {cierreSummary.diferencia >= 0 ? "+" : ""}
                {formatCurrency(cierreSummary.diferencia)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Caja Abierta */}
      {!caja && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center bg-muted">
                <CashRegister className="size-5 text-muted-foreground" weight="duotone" />
              </div>
              <div>
                <CardTitle>No hay caja abierta</CardTitle>
                <CardDescription>
                  Ingrese el monto inicial para abrir la caja del dia
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="montoInicial">Monto Inicial</Label>
                <Input
                  id="montoInicial"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                />
              </div>
              <Button onClick={handleOpenCaja} disabled={openingCaja}>
                <CashRegister className="size-4" />
                {openingCaja ? "Abriendo..." : "Abrir Caja"}
              </Button>
            </div>
            {error && !caja && (
              <p className="mt-2 text-xs text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Caja Abierta */}
      {caja && caja.estado === "abierta" && (
        <>
          {/* Caja Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informacion de Caja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Fecha de Apertura
                  </p>
                  <p className="text-sm font-medium">
                    {formatDateTime(caja.fechaApertura)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Monto Inicial</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(caja.montoInicial)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <StatusBadge status={caja.estado} config={CAJA_ESTADOS} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Movimientos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Movimientos de Caja</CardTitle>
                <Button size="sm" onClick={handleOpenMovDialog}>
                  <Plus className="size-4" />
                  Nuevo Movimiento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable<MovimientoCaja>
                columns={movimientoColumns}
                data={movimientos}
                emptyMessage="No hay movimientos registrados."
              />
            </CardContent>
          </Card>

          {/* Cerrar Caja */}
          <Card>
            <CardHeader>
              <CardTitle>Cerrar Caja</CardTitle>
              <CardDescription>
                Ingrese el monto final contado para cerrar la caja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="montoFinal">Monto Final Contado</Label>
                  <Input
                    id="montoFinal"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={montoFinal}
                    onChange={(e) => setMontoFinal(e.target.value)}
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setError("");
                    const monto = Number(montoFinal);
                    if (!montoFinal.trim() || isNaN(monto) || monto < 0) {
                      setError("Ingrese un monto final valido.");
                      return;
                    }
                    setConfirmCloseOpen(true);
                  }}
                  disabled={closingCaja}
                >
                  <LockSimple className="size-4" />
                  {closingCaja ? "Cerrando..." : "Cerrar Caja"}
                </Button>
              </div>
              {error && caja && (
                <p className="mt-2 text-xs text-destructive">{error}</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirm Close Dialog */}
      <ConfirmDialog
        open={confirmCloseOpen}
        onOpenChange={setConfirmCloseOpen}
        title="Cerrar Caja"
        description={`Esta seguro de cerrar la caja con un monto final de ${formatCurrency(Number(montoFinal) || 0)}? Esta accion no se puede deshacer.`}
        onConfirm={handleCloseCaja}
        confirmText="Cerrar Caja"
        destructive
      />

      {/* New Movement Dialog */}
      <Dialog open={movDialogOpen} onOpenChange={setMovDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Movimiento</DialogTitle>
            <DialogDescription>
              Registre un ingreso o egreso de caja
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitMovimiento} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={movForm.tipo}
                onValueChange={(value) =>
                  setMovForm((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concepto">Concepto</Label>
              <Input
                id="concepto"
                placeholder="Descripcion del movimiento"
                value={movForm.concepto}
                onChange={(e) =>
                  setMovForm((prev) => ({ ...prev, concepto: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="movMonto">Monto</Label>
              <Input
                id="movMonto"
                type="number"
                min="1"
                placeholder="0"
                value={movForm.monto}
                onChange={(e) =>
                  setMovForm((prev) => ({ ...prev, monto: e.target.value }))
                }
              />
            </div>

            {error && movDialogOpen && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMovDialogOpen(false)}
                disabled={submittingMov}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submittingMov}>
                {submittingMov ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
