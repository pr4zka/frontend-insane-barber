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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { libroVentasService } from "@/services/libro-ventas.service";
import { formatCurrency, formatDate, formatDateTime, METODOS_PAGO } from "@/lib/constants";

import { toast } from "sonner";
import type { LibroVentas, MetodoPago } from "@/types";

export default function LibroVentasPage() {
  const [ventas, setVentas] = useState<LibroVentas[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<LibroVentas[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [metodoPagoFilter, setMetodoPagoFilter] = useState("todos");

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libroVentasService.getAll();
      setVentas(res.data);
      setFilteredVentas(res.data);
    } catch {
      toast.error("Error al cargar libro de ventas");
      setVentas([]);
      setFilteredVentas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  const handleFilter = () => {
    let result = [...ventas];

    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      result = result.filter((v) => new Date(v.fecha) >= desde);
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      result = result.filter((v) => new Date(v.fecha) <= hasta);
    }

    if (metodoPagoFilter !== "todos") {
      result = result.filter((v) => v.metodoPago === metodoPagoFilter);
    }

    setFilteredVentas(result);
  };

  const totalSum = filteredVentas.reduce((sum, v) => sum + v.monto, 0);

  const handleDownloadPdf = async () => {
    const { generatePdf } = await import("@/lib/pdf");
    const subtitle =
      fechaDesde || fechaHasta
        ? `Periodo: ${fechaDesde || "inicio"} - ${fechaHasta || "actual"}`
        : undefined;

    generatePdf({
      title: "Libro de Ventas",
      subtitle,
      columns: ["Fecha", "Concepto", "Metodo Pago", "Monto"],
      rows: filteredVentas.map((v) => [
        formatDate(v.fecha),
        v.concepto,
        METODOS_PAGO[v.metodoPago as MetodoPago] ?? v.metodoPago,
        formatCurrency(v.monto),
      ]),
      totals: [{ label: "Total", value: formatCurrency(totalSum) }],
      filename: "libro-ventas",
    });
  };

  const columns: DataTableColumn<LibroVentas>[] = [
    {
      key: "fecha",
      header: "Fecha",
      render: (venta) => formatDateTime(venta.fecha),
    },
    {
      key: "concepto",
      header: "Concepto",
    },
    {
      key: "monto",
      header: "Monto",
      render: (venta) => (
        <span className="font-medium">{formatCurrency(venta.monto)}</span>
      ),
    },
    {
      key: "metodoPago",
      header: "Metodo de Pago",
      render: (venta) =>
        METODOS_PAGO[venta.metodoPago as MetodoPago] ?? venta.metodoPago,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Libro de Ventas"
        description="Registro de todas las ventas realizadas"
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
            <div className="flex-1 space-y-2">
              <Label>Metodo de Pago</Label>
              <Select
                value={metodoPagoFilter}
                onValueChange={setMetodoPagoFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="dpago">Dpago</SelectItem>
                </SelectContent>
              </Select>
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
      <DataTable<LibroVentas>
        columns={columns}
        data={filteredVentas}
        loading={loading}
        emptyMessage="No se encontraron ventas con los filtros aplicados."
      />

      {/* Total */}
      {!loading && filteredVentas.length > 0 && (
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
