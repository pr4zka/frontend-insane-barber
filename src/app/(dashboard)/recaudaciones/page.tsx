"use client";

import { useState, useEffect } from "react";
import {
  CurrencyCircleDollar,
  Money,
  CreditCard,
  FilePdf,
} from "@phosphor-icons/react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { cajaService } from "@/services/caja.service";
import { formatCurrency, formatDate, METODOS_PAGO } from "@/lib/constants";
import { toast } from "sonner";
import type { Recaudacion, MetodoPago } from "@/types";

export default function RecaudacionesPage() {
  const [recaudaciones, setRecaudaciones] = useState<Recaudacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecaudaciones() {
      setLoading(true);
      try {
        const res = await cajaService.getCollections();
        setRecaudaciones(res.data);
      } catch {
        toast.error("Error al cargar recaudaciones");
        setRecaudaciones([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecaudaciones();
  }, []);

  const totalRecaudado = recaudaciones.reduce((sum, r) => sum + r.total, 0);
  const totalEfectivo = recaudaciones
    .filter((r) => r.metodoPago === "efectivo")
    .reduce((sum, r) => sum + r.total, 0);
  const totalDpago = recaudaciones
    .filter((r) => r.metodoPago === "dpago")
    .reduce((sum, r) => sum + r.total, 0);

  const summaryCards = [
    {
      title: "Total Recaudado",
      value: formatCurrency(totalRecaudado),
      icon: CurrencyCircleDollar,
    },
    {
      title: "Efectivo",
      value: formatCurrency(totalEfectivo),
      icon: Money,
    },
    {
      title: "Dpago",
      value: formatCurrency(totalDpago),
      icon: CreditCard,
    },
  ];

  const handleDownloadPdf = async () => {
    const { generatePdf } = await import("@/lib/pdf");
    generatePdf({
      title: "Recaudaciones",
      columns: ["Fecha", "Metodo de Pago", "Total", "Cant. Pagos"],
      rows: recaudaciones.map((r) => [
        formatDate(r.fecha),
        METODOS_PAGO[r.metodoPago as MetodoPago] ?? r.metodoPago,
        formatCurrency(r.total),
        r.cantidadPagos,
      ]),
      totals: [{ label: "Total Recaudado", value: formatCurrency(totalRecaudado) }],
      filename: "recaudaciones",
    });
  };

  const columns: DataTableColumn<Recaudacion>[] = [
    {
      key: "fecha",
      header: "Fecha",
      render: (rec) => formatDate(rec.fecha),
    },
    {
      key: "metodoPago",
      header: "Metodo de Pago",
      render: (rec) =>
        METODOS_PAGO[rec.metodoPago as MetodoPago] ?? rec.metodoPago,
    },
    {
      key: "total",
      header: "Total",
      render: (rec) => (
        <span className="font-medium">{formatCurrency(rec.total)}</span>
      ),
    },
    {
      key: "cantidadPagos",
      header: "Cantidad de Pagos",
      render: (rec) => (
        <span className="text-xs">{rec.cantidadPagos}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recaudaciones a Depositar"
        description="Montos recaudados pendientes de deposito bancario"
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={loading || recaudaciones.length === 0}
          >
            <FilePdf className="size-4" />
            Descargar PDF
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4">
              {loading ? (
                <>
                  <Skeleton className="size-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    <card.icon className="size-5" weight="duotone" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-lg font-semibold tracking-tight">
                      {card.value}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Table */}
      <DataTable<Recaudacion>
        columns={columns}
        data={recaudaciones}
        loading={loading}
        emptyMessage="No hay recaudaciones registradas."
      />
    </div>
  );
}
