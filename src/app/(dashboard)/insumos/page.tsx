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
import { insumosService } from "@/services/insumos.service";
import { toast } from "sonner";
import type { Insumo } from "@/types";

interface FormData {
  nombre: string;
  descripcion: string;
  unidad: string;
  stock: string;
  estado: boolean;
}

const INITIAL_FORM: FormData = {
  nombre: "",
  descripcion: "",
  unidad: "",
  stock: "",
  estado: true,
};

export default function InsumosPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchInsumos = async () => {
    setLoading(true);
    try {
      const res = await insumosService.getAll();
      setInsumos(res.data);
    } catch {
      toast.error("Error al cargar insumos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
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
    if (!formData.unidad.trim()) {
      setError("La unidad es requerida.");
      return;
    }
    if (!formData.stock || Number(formData.stock) < 0) {
      setError("El stock debe ser 0 o mayor.");
      return;
    }

    setSubmitting(true);
    try {
      await insumosService.create({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        unidad: formData.unidad.trim(),
        stock: Number(formData.stock),
        estado: formData.estado,
      });
      setDialogOpen(false);
      fetchInsumos();
    } catch {
      setError("Error al crear el insumo. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<Insumo>[] = [
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "descripcion",
      header: "Descripcion",
    },
    {
      key: "unidad",
      header: "Unidad",
    },
    {
      key: "stock",
      header: "Stock",
      render: (insumo) => String(insumo.stock),
    },
    {
      key: "estado",
      header: "Estado",
      render: (insumo) => (
        <StatusBadge
          status={String(insumo.estado)}
          config={ESTADO_ACTIVO}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insumos"
        description="Gestiona los insumos y materiales de la barberia."
        action={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="size-4" />
            Nuevo Insumo
          </Button>
        }
      />

      <DataTable<Insumo>
        columns={columns}
        data={insumos}
        loading={loading}
        emptyMessage="No se encontraron insumos."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Insumo</DialogTitle>
            <DialogDescription>
              Complete los datos para registrar un nuevo insumo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Nombre del insumo"
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
                placeholder="Descripcion del insumo"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad</Label>
                <Input
                  id="unidad"
                  placeholder="ej: ml, unidades, gr"
                  value={formData.unidad}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      unidad: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stock: e.target.value,
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
