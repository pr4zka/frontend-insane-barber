"use client";

import { useState, useEffect } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, ESTADO_ACTIVO } from "@/components/shared/status-badge";
import { promocionesService } from "@/services/promociones.service";
import { formatDate } from "@/lib/constants";
import { toast } from "sonner";
import type { Promocion } from "@/types";

interface FormData {
  nombre: string;
  descripcion: string;
  porcentaje: string;
  fechaInicio: string;
  fechaFin: string;
  estado: boolean;
}

const INITIAL_FORM: FormData = {
  nombre: "",
  descripcion: "",
  porcentaje: "",
  fechaInicio: "",
  fechaFin: "",
  estado: true,
};

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchPromociones = async () => {
    setLoading(true);
    try {
      const res = await promocionesService.getAll();
      setPromociones(res.data);
    } catch {
      toast.error("Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromociones();
  }, []);

  const handleOpenDialog = () => {
    setFormData(INITIAL_FORM);
    setError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre.trim()) {
      setError("El nombre es requerido.");
      return;
    }
    if (!formData.porcentaje || Number(formData.porcentaje) <= 0 || Number(formData.porcentaje) > 100) {
      setError("El porcentaje debe estar entre 1 y 100.");
      return;
    }
    if (!formData.fechaInicio) {
      setError("La fecha de inicio es requerida.");
      return;
    }
    if (!formData.fechaFin) {
      setError("La fecha de fin es requerida.");
      return;
    }
    if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio.");
      return;
    }

    setSubmitting(true);
    try {
      await promocionesService.create({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        porcentaje: Number(formData.porcentaje),
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        estado: formData.estado,
      });
      setDialogOpen(false);
      fetchPromociones();
    } catch {
      setError("Error al crear la promocion. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<Promocion>[] = [
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "descripcion",
      header: "Descripcion",
    },
    {
      key: "porcentaje",
      header: "Porcentaje",
      render: (promocion) => `${promocion.porcentaje}%`,
    },
    {
      key: "fechaInicio",
      header: "Fecha Inicio",
      render: (promocion) => formatDate(promocion.fechaInicio),
    },
    {
      key: "fechaFin",
      header: "Fecha Fin",
      render: (promocion) => formatDate(promocion.fechaFin),
    },
    {
      key: "estado",
      header: "Estado",
      render: (promocion) => (
        <StatusBadge
          status={String(promocion.estado)}
          config={ESTADO_ACTIVO}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promociones"
        description="Gestiona las promociones activas de la barberia."
        action={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="size-4" />
            Nueva Promocion
          </Button>
        }
      />

      <DataTable<Promocion>
        columns={columns}
        data={promociones}
        loading={loading}
        emptyMessage="No se encontraron promociones."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Promocion</DialogTitle>
            <DialogDescription>
              Complete los datos para crear una nueva promocion.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Nombre de la promocion"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, nombre: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripcion de la promocion"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="porcentaje">Porcentaje (%)</Label>
              <Input
                id="porcentaje"
                type="number"
                min="1"
                max="100"
                placeholder="10"
                value={formData.porcentaje}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    porcentaje: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fechaInicio: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha Fin</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fechaFin: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="estado"
                checked={formData.estado}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    estado: checked === true,
                  }))
                }
              />
              <Label htmlFor="estado">
                {formData.estado ? "Activa" : "Inactiva"}
              </Label>
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
