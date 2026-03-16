"use client";

import { useState, useEffect, useCallback } from "react";
import { FunnelSimple, FilePdf } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { libroComprasService } from "@/services/compras.service";
import { formatDate, formatCurrency } from "@/lib/constants";

import { toast } from "sonner";
import type { LibroCompras } from "@/types";

export default function LibroComprasPage() {
  const [entries, setEntries] = useState<LibroCompras[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LibroCompras[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libroComprasService.getAll();
      setEntries(res.data);
      setFilteredEntries(res.data);
    } catch {
      toast.error("Error al cargar libro de compras");
      setEntries([]);
      setFilteredEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleFilter = () => {
    let result = [...entries];

    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      result = result.filter((e) => new Date(e.fecha) >= desde);
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      result = result.filter((e) => new Date(e.fecha) <= hasta);
    }

    setFilteredEntries(result);
  };

  const totalSum = filteredEntries.reduce((sum, e) => sum + e.monto, 0);

  const handleDownloadPdf = async () => {
    const { generatePdf } = await import("@/lib/pdf");
    const subtitle =
      fechaDesde || fechaHasta
        ? `Periodo: ${fechaDesde || "inicio"} - ${fechaHasta || "actual"}`
        : undefined;

    generatePdf({
      title: "Libro de Compras",
      subtitle,
      columns: ["Fecha", "Concepto", "Proveedor", "Monto"],
      rows: filteredEntries.map((e) => [
        formatDate(e.fecha),
        e.concepto,
        e.proveedor,
        formatCurrency(e.monto),
      ]),
      totals: [{ label: "Total", value: formatCurrency(totalSum) }],
      filename: "libro-compras",
    });
  };

  const columns: DataTableColumn<LibroCompras>[] = [
    {
      key: "fecha",
      header: "Fecha",
      render: (entry) => formatDate(entry.fecha),
    },
    {
      key: "concepto",
      header: "Concepto",
    },
    {
      key: "proveedor",
      header: "Proveedor",
    },
    {
      key: "monto",
      header: "Monto",
      render: (entry) => (
        <span className="font-medium">{formatCurrency(entry.monto)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Libro de Compras"
        description="Registro de todas las compras realizadas"
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="fechaDesde">Fecha Desde</Label>
              <Input
                id="fechaDesde"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="fechaHasta">Fecha Hasta</Label>
              <Input
                id="fechaHasta"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
            <Button onClick={handleFilter} size="sm">
              <FunnelSimple className="size-4" />
              Filtrar
            </Button>
            <Button onClick={handleDownloadPdf} size="sm" variant="outline">
              <FilePdf className="size-4" />
              Descargar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable<LibroCompras>
        columns={columns}
        data={filteredEntries}
        loading={loading}
        emptyMessage="No se encontraron registros de compras."
      />

      {/* Total */}
      {!loading && filteredEntries.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between pt-4">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">
              {formatCurrency(totalSum)}
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
