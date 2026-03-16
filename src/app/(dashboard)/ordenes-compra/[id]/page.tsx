"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FilePdf } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ordenesCompraService } from "@/services/compras.service";
import { formatCurrency, formatDate } from "@/lib/constants";
import type { OrdenCompra } from "@/types";
import { toast } from "sonner";

const ORDEN_COMPRA_ESTADOS: Record<
  string,
  { label: string; className: string }
> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  aprobada: {
    label: "Aprobada",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  recibida: {
    label: "Recibida",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  cancelada: {
    label: "Cancelada",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

export default function DetalleOrdenCompraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [orden, setOrden] = useState<OrdenCompra | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrden = async () => {
    setLoading(true);
    try {
      const res = await ordenesCompraService.getById(Number(id));
      setOrden(res.data);
    } catch {
      setError("Error al cargar la orden de compra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrden();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await ordenesCompraService.approve(Number(id));
      toast.success("Orden aprobada correctamente.");
      await fetchOrden();
    } catch {
      toast.error("Error al aprobar la orden.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await ordenesCompraService.cancel(Number(id));
      toast.success("Orden cancelada correctamente.");
      await fetchOrden();
    } catch {
      toast.error("Error al cancelar la orden.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceive = async () => {
    setActionLoading(true);
    try {
      await ordenesCompraService.receive(Number(id));
      toast.success("Mercaderia recibida correctamente.");
      await fetchOrden();
    } catch {
      toast.error("Error al recibir la mercaderia.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!orden) return;
    const { generatePdf } = await import("@/lib/pdf");
    generatePdf({
      title: `Orden de Compra #${orden.id}`,
      subtitle: `Proveedor: ${orden.proveedor?.nombre} | Fecha: ${formatDate(orden.fecha)} | Estado: ${orden.estado}`,
      columns: ["Insumo", "Cantidad", "Precio Unitario", "Subtotal"],
      rows: (orden.detalles ?? []).map((d) => [
        d.insumo?.nombre ?? "-",
        d.cantidad,
        formatCurrency(d.precioUnitario),
        formatCurrency(d.subtotal),
      ]),
      totals: [{ label: "Total", value: formatCurrency(orden.total) }],
      filename: `orden-compra-${orden.id}`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Detalle de Orden de Compra"
          action={
            <Button size="sm" variant="outline" asChild>
              <Link href="/ordenes-compra">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Detalle de Orden de Compra"
          action={
            <Button size="sm" variant="outline" asChild>
              <Link href="/ordenes-compra">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">
              Orden de compra no encontrada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle de Orden de Compra"
        action={
          <Button size="sm" variant="outline" asChild>
            <Link href="/ordenes-compra">
              <ArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Informacion de la Orden</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Proveedor
              </p>
              <p className="text-sm">{orden.proveedor?.nombre ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Fecha</p>
              <p className="text-sm">{formatDate(orden.fecha)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Estado
              </p>
              <StatusBadge
                status={orden.estado}
                config={ORDEN_COMPRA_ESTADOS}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total</p>
              <p className="text-sm font-semibold">
                {formatCurrency(orden.total)}
              </p>
            </div>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
            >
              <FilePdf className="size-4" />
              Descargar PDF
            </Button>
          </div>
          {orden.observacion && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Observacion
              </p>
              <p className="text-sm">{orden.observacion}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead className="w-24">Cantidad</TableHead>
                <TableHead className="w-36">Precio Unitario</TableHead>
                <TableHead className="w-36">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orden.detalles?.map((detalle) => (
                <TableRow key={detalle.id}>
                  <TableCell>{detalle.insumo?.nombre ?? "-"}</TableCell>
                  <TableCell>{detalle.cantidad}</TableCell>
                  <TableCell>
                    {formatCurrency(detalle.precioUnitario)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(detalle.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-right font-semibold"
                >
                  Total
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(orden.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {orden.estado === "pendiente" && (
        <div className="flex gap-3">
          <Button
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? "Procesando..." : "Aprobar"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={actionLoading}
          >
            {actionLoading ? "Procesando..." : "Cancelar"}
          </Button>
        </div>
      )}

      {orden.estado === "aprobada" && (
        <div className="flex gap-3">
          <Button
            onClick={handleReceive}
            disabled={actionLoading}
          >
            {actionLoading ? "Procesando..." : "Recibir Mercaderia"}
          </Button>
        </div>
      )}

      {orden.estado === "recibida" && (
        <div className="space-y-4">
          {orden.libroCompras && (
            <Card>
              <CardHeader>
                <CardTitle>Libro de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Fecha
                    </p>
                    <p className="text-sm">
                      {formatDate(orden.libroCompras.fecha)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Concepto
                    </p>
                    <p className="text-sm">{orden.libroCompras.concepto}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Monto
                    </p>
                    <p className="text-sm font-semibold">
                      {formatCurrency(orden.libroCompras.monto)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {orden.notaRemision && (
            <Card>
              <CardHeader>
                <CardTitle>Nota de Remision</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Fecha
                    </p>
                    <p className="text-sm">
                      {formatDate(orden.notaRemision.fecha)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Observacion
                    </p>
                    <p className="text-sm">
                      {orden.notaRemision.observacion || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
