"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, DownloadSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import {
  StatusBadge,
  PRESUPUESTO_ESTADOS,
} from "@/components/shared/status-badge";
import { presupuestosService } from "@/services/presupuestos.service";
import { formatCurrency, formatDate } from "@/lib/constants";

import type { Presupuesto } from "@/types";

export default function DetallePresupuestoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [presupuesto, setPresupuesto] = useState<Presupuesto | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPresupuesto = async () => {
      setLoading(true);
      try {
        const res = await presupuestosService.getById(Number(id));
        setPresupuesto(res.data);
      } catch {
        setError("Error al cargar el presupuesto.");
      } finally {
        setLoading(false);
      }
    };
    fetchPresupuesto();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!presupuesto) return;
    setDownloading(true);
    try {
      const { generatePdf } = await import("@/lib/pdf");
      generatePdf({
        title: `Presupuesto #${presupuesto.id}`,
        subtitle: `Cliente: ${presupuesto.cliente?.nombre} | Fecha: ${formatDate(presupuesto.fecha)} | Estado: ${presupuesto.estado}`,
        columns: ["Servicio", "Cantidad", "Precio Unitario", "Subtotal"],
        rows: (presupuesto.detalles ?? []).map((d) => [
          d.servicio?.nombre ?? "-",
          d.cantidad,
          formatCurrency(d.precioUnitario),
          formatCurrency(d.subtotal),
        ]),
        totals: [{ label: "Total", value: formatCurrency(presupuesto.total) }],
        filename: `presupuesto-${presupuesto.id}`,
      });
    } catch {
      setError("Error al generar el PDF.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Detalle de Presupuesto"
          action={
            <Button size="sm" variant="outline" asChild>
              <Link href="/presupuestos">
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

  if (!presupuesto) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Detalle de Presupuesto"
          action={
            <Button size="sm" variant="outline" asChild>
              <Link href="/presupuestos">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="py-8">
            <p className="text-sm text-muted-foreground">
              Presupuesto no encontrado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle de Presupuesto"
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={downloading}
            >
              <DownloadSimple className="size-4" />
              {downloading ? "Descargando..." : "Descargar PDF"}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/presupuestos">
                <ArrowLeft className="size-4" />
                Volver
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Informacion del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Cliente
              </p>
              <p className="text-sm">{presupuesto.cliente?.nombre ?? "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Fecha</p>
              <p className="text-sm">{formatDate(presupuesto.fecha)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Estado
              </p>
              <StatusBadge
                status={presupuesto.estado}
                config={PRESUPUESTO_ESTADOS}
              />
            </div>
          </div>
          {presupuesto.observacion && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Observacion
              </p>
              <p className="text-sm">{presupuesto.observacion}</p>
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
                <TableHead>Servicio</TableHead>
                <TableHead className="w-24">Cantidad</TableHead>
                <TableHead className="w-36">Precio Unitario</TableHead>
                <TableHead className="w-36">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presupuesto.detalles?.map((detalle) => (
                <TableRow key={detalle.id}>
                  <TableCell>{detalle.servicio?.nombre ?? "-"}</TableCell>
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
                  {formatCurrency(presupuesto.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
