"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ajustesCompraService, ordenesCompraService } from "@/services/compras.service";
import { formatCurrency, formatDate } from "@/lib/constants";
import { toast } from "sonner";
import type { AjusteCompra, OrdenCompra } from "@/types";

interface AjusteForm {
  ordenCompraId: string;
  tipo: string;
  descripcion: string;
  montoAnterior: string;
  montoNuevo: string;
}

const INITIAL_FORM: AjusteForm = {
  ordenCompraId: "",
  tipo: "",
  descripcion: "",
  montoAnterior: "",
  montoNuevo: "",
};

export default function AjustesCompraPage() {
  const [ajustes, setAjustes] = useState<AjusteCompra[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<AjusteForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ajustesRes, ordenesRes] = await Promise.allSettled([
        ajustesCompraService.getAll(),
        ordenesCompraService.getAll(),
      ]);

      if (ajustesRes.status === "fulfilled") {
        setAjustes(ajustesRes.value.data);
      }
      if (ordenesRes.status === "fulfilled") {
        setOrdenes(
          ordenesRes.value.data.filter((o: OrdenCompra) => o.estado === "recibida")
        );
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

    if (!formData.ordenCompraId) {
      setError("Seleccione una orden de compra.");
      return;
    }
    if (!formData.tipo) {
      setError("Seleccione el tipo de ajuste.");
      return;
    }
    if (!formData.descripcion.trim()) {
      setError("Ingrese una descripcion del ajuste.");
      return;
    }
    const montoAnteriorNum = Number(formData.montoAnterior);
    if (!formData.montoAnterior.trim() || isNaN(montoAnteriorNum) || montoAnteriorNum < 0) {
      setError("Ingrese un monto anterior valido.");
      return;
    }
    const montoNuevoNum = Number(formData.montoNuevo);
    if (!formData.montoNuevo.trim() || isNaN(montoNuevoNum) || montoNuevoNum < 0) {
      setError("Ingrese un monto nuevo valido.");
      return;
    }

    setSubmitting(true);
    try {
      await ajustesCompraService.create({
        ordenCompraId: Number(formData.ordenCompraId),
        tipo: formData.tipo,
        descripcion: formData.descripcion.trim(),
        montoAnterior: montoAnteriorNum,
        montoNuevo: montoNuevoNum,
      });
      toast.success("Ajuste creado exitosamente.");
      setDialogOpen(false);
      fetchData();
    } catch {
      setError("Error al crear el ajuste. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<AjusteCompra>[] = [
    {
      key: "id",
      header: "#",
      render: (ajuste) => (
        <span className="font-mono text-xs">#{ajuste.id}</span>
      ),
    },
    {
      key: "ordenCompraId",
      header: "Orden",
      render: (ajuste) => (
        <span className="font-mono text-xs">OC #{ajuste.ordenCompraId}</span>
      ),
    },
    {
      key: "proveedor",
      header: "Proveedor",
      render: (ajuste) => ajuste.ordenCompra?.proveedor?.nombre ?? "-",
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (ajuste) => (
        <span className="capitalize">{ajuste.tipo}</span>
      ),
    },
    {
      key: "descripcion",
      header: "Descripcion",
    },
    {
      key: "montoAnterior",
      header: "Monto Anterior",
      render: (ajuste) => (
        <span className="font-medium">{formatCurrency(ajuste.montoAnterior)}</span>
      ),
    },
    {
      key: "montoNuevo",
      header: "Monto Nuevo",
      render: (ajuste) => (
        <span className="font-medium">{formatCurrency(ajuste.montoNuevo)}</span>
      ),
    },
    {
      key: "diferencia",
      header: "Diferencia",
      render: (ajuste) => (
        <span className="font-medium">
          {formatCurrency(ajuste.montoNuevo - ajuste.montoAnterior)}
        </span>
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (ajuste) => formatDate(ajuste.fecha),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ajustes de Compras"
        description="Correcciones de cantidad o precio sobre ordenes de compra recibidas"
        action={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="size-4" />
            Nuevo Ajuste
          </Button>
        }
      />

      <DataTable<AjusteCompra>
        columns={columns}
        data={ajustes}
        loading={loading}
        emptyMessage="No se encontraron ajustes registrados."
      />

      {/* New Ajuste Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Ajuste</DialogTitle>
            <DialogDescription>
              Registre un ajuste de cantidad o precio sobre una orden de compra recibida
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Orden de Compra</Label>
              <Select
                value={formData.ordenCompraId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, ordenCompraId: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione una orden" />
                </SelectTrigger>
                <SelectContent>
                  {ordenes.map((orden) => (
                    <SelectItem key={orden.id} value={String(orden.id)}>
                      OC #{orden.id} -{" "}
                      {orden.proveedor?.nombre ?? "Sin proveedor"} -{" "}
                      {formatCurrency(orden.total)}
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
                  <SelectItem value="cantidad">Cantidad</SelectItem>
                  <SelectItem value="precio">Precio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                placeholder="Describa el motivo del ajuste"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, descripcion: e.target.value }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="montoAnterior">Monto Anterior</Label>
              <Input
                id="montoAnterior"
                type="number"
                min="0"
                placeholder="0"
                value={formData.montoAnterior}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, montoAnterior: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="montoNuevo">Monto Nuevo</Label>
              <Input
                id="montoNuevo"
                type="number"
                min="0"
                placeholder="0"
                value={formData.montoNuevo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, montoNuevo: e.target.value }))
                }
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
