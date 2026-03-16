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
import { descuentosService } from "@/services/descuentos.service";
import { toast } from "sonner";
import type { Descuento } from "@/types";

interface FormData {
  nombre: string;
  descripcion: string;
  porcentaje: string;
  estado: boolean;
}

const INITIAL_FORM: FormData = {
  nombre: "",
  descripcion: "",
  porcentaje: "",
  estado: true,
};

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchDescuentos = async () => {
    setLoading(true);
    try {
      const res = await descuentosService.getAll();
      setDescuentos(res.data);
    } catch {
      toast.error("Error al cargar descuentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDescuentos();
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

    setSubmitting(true);
    try {
      await descuentosService.create({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        porcentaje: Number(formData.porcentaje),
        estado: formData.estado,
      });
      setDialogOpen(false);
      fetchDescuentos();
    } catch {
      setError("Error al crear el descuento. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<Descuento>[] = [
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
      render: (descuento) => `${descuento.porcentaje}%`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (descuento) => (
        <StatusBadge
          status={String(descuento.estado)}
          config={ESTADO_ACTIVO}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Descuentos"
        description="Gestiona los descuentos disponibles."
        action={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="size-4" />
            Nuevo Descuento
          </Button>
        }
      />

      <DataTable<Descuento>
        columns={columns}
        data={descuentos}
        loading={loading}
        emptyMessage="No se encontraron descuentos."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Descuento</DialogTitle>
            <DialogDescription>
              Complete los datos para crear un nuevo descuento.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Nombre del descuento"
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
                placeholder="Descripcion del descuento"
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
                {formData.estado ? "Activo" : "Inactivo"}
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
