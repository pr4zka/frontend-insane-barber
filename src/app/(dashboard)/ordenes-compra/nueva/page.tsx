"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { ordenesCompraService, proveedoresService } from "@/services/compras.service";
import { insumosService } from "@/services/insumos.service";
import { formatCurrency } from "@/lib/constants";
import type { Proveedor, Insumo } from "@/types";
import { toast } from "sonner";

interface DetalleRow {
  insumoId: string;
  cantidad: string;
  precioUnitario: string;
  subtotal: number;
}

const EMPTY_DETALLE: DetalleRow = {
  insumoId: "",
  cantidad: "1",
  precioUnitario: "0",
  subtotal: 0,
};

export default function NuevaOrdenCompraPage() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [proveedorId, setProveedorId] = useState("");
  const [observacion, setObservacion] = useState("");
  const [detalles, setDetalles] = useState<DetalleRow[]>([{ ...EMPTY_DETALLE }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proveedoresRes, insumosRes] = await Promise.all([
          proveedoresService.getAll(),
          insumosService.getAll(),
        ]);
        setProveedores(proveedoresRes.data.filter((p: Proveedor) => p.estado));
        setInsumos(insumosRes.data.filter((i: Insumo) => i.estado));
      } catch {
        // Error handled silently
      }
    };
    fetchData();
  }, []);

  const handleDetalleChange = (
    index: number,
    field: keyof DetalleRow,
    value: string
  ) => {
    setDetalles((prev) => {
      const updated = [...prev];
      const row = { ...updated[index] };

      if (field === "insumoId") {
        row.insumoId = value;
        row.subtotal = Number(row.precioUnitario || 0) * Number(row.cantidad || 0);
      } else if (field === "cantidad") {
        row.cantidad = value;
        row.subtotal = Number(row.precioUnitario || 0) * Number(value || 0);
      } else if (field === "precioUnitario") {
        row.precioUnitario = value;
        row.subtotal = Number(value || 0) * Number(row.cantidad || 0);
      }

      updated[index] = row;
      return updated;
    });
  };

  const addDetalle = () => {
    setDetalles((prev) => [...prev, { ...EMPTY_DETALLE }]);
  };

  const removeDetalle = (index: number) => {
    setDetalles((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const total = detalles.reduce((sum, d) => sum + d.subtotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!proveedorId) {
      setError("Seleccione un proveedor.");
      return;
    }

    const validDetalles = detalles.filter(
      (d) => d.insumoId && Number(d.cantidad) > 0 && Number(d.precioUnitario) > 0
    );

    if (validDetalles.length === 0) {
      setError("Agregue al menos un insumo a la orden.");
      return;
    }

    setSubmitting(true);
    try {
      await ordenesCompraService.create({
        proveedorId: Number(proveedorId),
        observacion: observacion.trim() || undefined,
        detalles: validDetalles.map((d) => ({
          insumoId: Number(d.insumoId),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
        })),
      });
      toast.success("Orden de compra creada correctamente.");
      router.push("/ordenes-compra");
    } catch {
      setError("Error al crear la orden de compra. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Nueva Orden de Compra" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Datos de la Orden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select value={proveedorId} onValueChange={setProveedorId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.id} value={String(proveedor.id)}>
                      {proveedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacion">Observacion</Label>
              <Textarea
                id="observacion"
                placeholder="Observaciones de la orden de compra"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-4xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detalles</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={addDetalle}>
              <Plus className="size-4" />
              Agregar Insumo
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insumo</TableHead>
                  <TableHead className="w-24">Cantidad</TableHead>
                  <TableHead className="w-36">Precio Unitario</TableHead>
                  <TableHead className="w-36">Subtotal</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detalles.map((detalle, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Select
                        value={detalle.insumoId}
                        onValueChange={(value) =>
                          handleDetalleChange(index, "insumoId", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {insumos.map((insumo) => (
                            <SelectItem
                              key={insumo.id}
                              value={String(insumo.id)}
                            >
                              {insumo.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={detalle.cantidad}
                        onChange={(e) =>
                          handleDetalleChange(index, "cantidad", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={detalle.precioUnitario}
                        onChange={(e) =>
                          handleDetalleChange(index, "precioUnitario", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(detalle.subtotal)}
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDetalle(index)}
                        disabled={detalles.length <= 1}
                      >
                        <Trash className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-lg font-semibold">{formatCurrency(total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/ordenes-compra">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
