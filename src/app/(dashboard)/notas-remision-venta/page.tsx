"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { pagosService } from "@/services/pagos.service";
import { turnosService } from "@/services/turnos.service";
import { formatDate } from "@/lib/constants";
import type { NotaRemisionVenta, Turno } from "@/types";

export default function NotasRemisionVentaPage() {
  const [notas, setNotas] = useState<NotaRemisionVenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [turnoId, setTurnoId] = useState("");
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchNotas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pagosService.getDeliveryNotes();
      setNotas(res.data);
    } catch {
      setNotas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTurnos = useCallback(async () => {
    try {
      const res = await turnosService.getAll();
      const filtered = res.data.filter(
        (t: Turno) => t.estado === "cobrado" || t.estado === "atendido"
      );
      setTurnos(filtered);
    } catch {
      setTurnos([]);
    }
  }, []);

  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]);

  const handleOpenDialog = () => {
    fetchTurnos();
    setTurnoId("");
    setObservacion("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!turnoId) {
      toast.error("Seleccione un turno");
      return;
    }
    setSubmitting(true);
    try {
      await pagosService.createDeliveryNote({
        turnoId: Number(turnoId),
        observacion: observacion || undefined,
      });
      toast.success("Nota de remision creada exitosamente");
      setOpen(false);
      fetchNotas();
    } catch {
      toast.error("Error al crear la nota de remision");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<NotaRemisionVenta>[] = [
    {
      key: "id",
      header: "#",
      render: (nota) => (
        <span className="font-mono text-xs">#{nota.id}</span>
      ),
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (nota) => nota.turno?.cliente?.nombre ?? "-",
    },
    {
      key: "servicio",
      header: "Servicio",
      render: (nota) => nota.turno?.servicio?.nombre ?? "-",
    },
    {
      key: "barbero",
      header: "Barbero",
      render: (nota) => nota.turno?.barbero?.nombre ?? "-",
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (nota) => formatDate(nota.fecha),
    },
    {
      key: "observacion",
      header: "Observacion",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas de Remision de Venta"
        description="Documentos de entrega de servicios a clientes"
        action={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="size-4" />
            Nueva Nota
          </Button>
        }
      />

      <DataTable<NotaRemisionVenta>
        columns={columns}
        data={notas}
        loading={loading}
        emptyMessage="No se encontraron notas de remision de venta."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Nota de Remision de Venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={turnoId} onValueChange={setTurnoId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un turno" />
                </SelectTrigger>
                <SelectContent>
                  {turnos.map((turno) => (
                    <SelectItem key={turno.id} value={String(turno.id)}>
                      {turno.cliente?.nombre ?? "Sin cliente"} - {turno.servicio?.nombre ?? "Sin servicio"} ({turno.estado})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observacion</Label>
              <Textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Observaciones opcionales..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Creando..." : "Crear Nota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
