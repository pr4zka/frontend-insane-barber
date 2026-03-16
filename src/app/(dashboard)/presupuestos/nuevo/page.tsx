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
import { presupuestosService } from "@/services/presupuestos.service";
import { clientesService } from "@/services/clientes.service";
import { serviciosService } from "@/services/servicios.service";
import { formatCurrency } from "@/lib/constants";
import type { Cliente, Servicio } from "@/types";

interface DetalleRow {
  servicioId: string;
  cantidad: string;
  precioUnitario: number;
  subtotal: number;
}

const EMPTY_DETALLE: DetalleRow = {
  servicioId: "",
  cantidad: "1",
  precioUnitario: 0,
  subtotal: 0,
};

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [observacion, setObservacion] = useState("");
  const [detalles, setDetalles] = useState<DetalleRow[]>([{ ...EMPTY_DETALLE }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, serviciosRes] = await Promise.all([
          clientesService.getAll(),
          serviciosService.getAll(),
        ]);
        setClientes(clientesRes.data);
        setServicios(serviciosRes.data.filter((s: Servicio) => s.estado));
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

      if (field === "servicioId") {
        row.servicioId = value;
        const servicio = servicios.find((s) => s.id === Number(value));
        row.precioUnitario = servicio?.precio ?? 0;
        row.subtotal = row.precioUnitario * Number(row.cantidad || 0);
      } else if (field === "cantidad") {
        row.cantidad = value;
        row.subtotal = row.precioUnitario * Number(value || 0);
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

    if (!clienteId) {
      setError("Seleccione un cliente.");
      return;
    }

    const validDetalles = detalles.filter(
      (d) => d.servicioId && Number(d.cantidad) > 0
    );

    if (validDetalles.length === 0) {
      setError("Agregue al menos un servicio al presupuesto.");
      return;
    }

    setSubmitting(true);
    try {
      await presupuestosService.create({
        clienteId: Number(clienteId),
        observacion: observacion.trim(),
        estado: "borrador",
        detalles: validDetalles.map((d) => ({
          servicioId: Number(d.servicioId),
          cantidad: Number(d.cantidad),
          precioUnitario: d.precioUnitario,
        })),
      });
      router.push("/presupuestos");
    } catch {
      setError("Error al crear el presupuesto. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo Presupuesto" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="max-w-4xl">
          <CardHeader>
            <CardTitle>Datos del Presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={String(cliente.id)}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacion">Observacion</Label>
              <Textarea
                id="observacion"
                placeholder="Observaciones del presupuesto"
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
              Agregar servicio
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
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
                        value={detalle.servicioId}
                        onValueChange={(value) =>
                          handleDetalleChange(index, "servicioId", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {servicios.map((servicio) => (
                            <SelectItem
                              key={servicio.id}
                              value={String(servicio.id)}
                            >
                              {servicio.nombre}
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
                    <TableCell className="text-sm">
                      {formatCurrency(detalle.precioUnitario)}
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
            {submitting ? "Guardando..." : "Crear Presupuesto"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/presupuestos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
