"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, ArrowUp, ArrowDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, NOTA_ESTADOS } from "@/components/shared/status-badge";
import { notasService } from "@/services/notas.service";
import { pagosService } from "@/services/pagos.service";
import { formatCurrency, formatDateTime } from "@/lib/constants";
import type { NotaCreditoDebito, Pago } from "@/types";

interface NotaForm {
  pagoId: string;
  tipo: string;
  monto: string;
  motivo: string;
}

const INITIAL_FORM: NotaForm = {
  pagoId: "",
  tipo: "",
  monto: "",
  motivo: "",
};

export default function NotasPage() {
  const [notas, setNotas] = useState<NotaCreditoDebito[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NotaForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notasRes, pagosRes] = await Promise.allSettled([
        notasService.getAll(),
        pagosService.getAll(),
      ]);

      if (notasRes.status === "fulfilled") {
        setNotas(notasRes.value.data);
      }
      if (pagosRes.status === "fulfilled") {
        setPagos(pagosRes.value.data);
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = () => {
    setFormData(INITIAL_FORM);
    setError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.pagoId) {
      setError("Seleccione un pago.");
      return;
    }
    if (!formData.tipo) {
      setError("Seleccione el tipo de nota.");
      return;
    }
    const montoNum = Number(formData.monto);
    if (!formData.monto.trim() || isNaN(montoNum) || montoNum <= 0) {
      setError("Ingrese un monto valido mayor a 0.");
      return;
    }
    if (!formData.motivo.trim()) {
      setError("Ingrese el motivo de la nota.");
      return;
    }

    setSubmitting(true);
    try {
      await notasService.create({
        pagoId: Number(formData.pagoId),
        tipo: formData.tipo as "credito" | "debito",
        monto: montoNum,
        motivo: formData.motivo.trim(),
      });
      setDialogOpen(false);
      fetchData();
    } catch {
      setError("Error al crear la nota. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<NotaCreditoDebito>[] = [
    {
      key: "tipo",
      header: "Tipo",
      render: (nota) =>
        nota.tipo === "credito" ? (
          <Badge
            variant="outline"
            className="border-transparent bg-green-500/10 text-green-700 dark:text-green-400"
          >
            <ArrowUp className="mr-1 size-3" />
            Credito
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-transparent bg-red-500/10 text-red-700 dark:text-red-400"
          >
            <ArrowDown className="mr-1 size-3" />
            Debito
          </Badge>
        ),
    },
    {
      key: "pagoId",
      header: "Pago Ref",
      render: (nota) => (
        <span className="font-mono text-xs">#{nota.pagoId}</span>
      ),
    },
    {
      key: "monto",
      header: "Monto",
      render: (nota) => (
        <span className="font-medium">{formatCurrency(nota.monto)}</span>
      ),
    },
    {
      key: "motivo",
      header: "Motivo",
    },
    {
      key: "estado",
      header: "Estado",
      render: (nota) => (
        <StatusBadge status={nota.estado} config={NOTA_ESTADOS} />
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (nota) => formatDateTime(nota.fecha),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas de Credito y Debito"
        description="Gestion de notas de credito y debito sobre pagos"
        action={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="size-4" />
            Nueva Nota
          </Button>
        }
      />

      <DataTable<NotaCreditoDebito>
        columns={columns}
        data={notas}
        loading={loading}
        emptyMessage="No se encontraron notas registradas."
      />

      {/* New Nota Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Nota</DialogTitle>
            <DialogDescription>
              Registre una nota de credito o debito asociada a un pago
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Pago</Label>
              <Select
                value={formData.pagoId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, pagoId: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un pago" />
                </SelectTrigger>
                <SelectContent>
                  {pagos.map((pago) => (
                    <SelectItem key={pago.id} value={String(pago.id)}>
                      #{pago.id} -{" "}
                      {pago.turno?.cliente?.nombre ?? "Sin cliente"} -{" "}
                      {formatCurrency(pago.monto)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credito">Credito</SelectItem>
                  <SelectItem value="debito">Debito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notaMonto">Monto</Label>
              <Input
                id="notaMonto"
                type="number"
                min="1"
                placeholder="0"
                value={formData.monto}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, monto: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                placeholder="Describa el motivo de la nota"
                value={formData.motivo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, motivo: e.target.value }))
                }
                rows={3}
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
