"use client";

import { useState } from "react";
import { MagnifyingGlass, FilePdf } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import {
  StatusBadge,
  RECLAMO_ESTADOS,
} from "@/components/shared/status-badge";
import { reportesService } from "@/services/reportes.service";
import { barberosService } from "@/services/barberos.service";
import { formatCurrency, formatDate } from "@/lib/constants";

import type {
  ReporteIngreso,
  ReporteTurno,
  ReporteServicio,
  Barbero,
} from "@/types";
import { useEffect } from "react";

// -------------------------------------------------------------------
// Reclamo report type (not exported by types/index but returned by API)
// -------------------------------------------------------------------
interface ReporteReclamo {
  id: number;
  descripcion: string;
  fecha: string;
  estado: string;
  cliente?: { nombre: string };
}

// -------------------------------------------------------------------
// Shared date-range filter state
// -------------------------------------------------------------------
function useDateRange() {
  const today = new Date().toISOString().split("T")[0];
  const [desde, setDesde] = useState(today);
  const [hasta, setHasta] = useState(today);
  return { desde, hasta, setDesde, setHasta };
}

// -------------------------------------------------------------------
// Skeleton rows for loading states
// -------------------------------------------------------------------
function TableSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <TableCell key={c}>
              <Skeleton className="h-4 w-[80%]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ===================================================================
// Ingresos Tab
// ===================================================================
function IngresosTab() {
  const { desde, hasta, setDesde, setHasta } = useDateRange();
  const [data, setData] = useState<ReporteIngreso[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleGenerar = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await reportesService.dailyIncome({
        fecha_desde: desde,
        fecha_hasta: hasta,
      });
      const results = res.data ?? [];
      setData(results);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const { generatePdf } = await import("@/lib/pdf");
    const total = data.reduce((sum, r) => sum + Number(r.totalMonto), 0);
    generatePdf({
      title: "Reporte de Ingresos Diarios",
      subtitle: `Desde ${desde} hasta ${hasta}`,
      columns: ["Fecha", "Total", "Cantidad"],
      rows: data.map((r) => [formatDate(r.fecha), formatCurrency(Number(r.totalMonto)), r.cantidadPagos]),
      totals: [{ label: "Total General", value: formatCurrency(total) }],
      filename: "reporte-ingresos-diarios",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="ingresos-desde">Desde</Label>
          <Input
            id="ingresos-desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ingresos-hasta">Hasta</Label>
          <Input
            id="ingresos-hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={handleGenerar} disabled={loading}>
          <MagnifyingGlass className="size-4" />
          {loading ? "Generando..." : "Generar Reporte"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={data.length === 0}>
          <FilePdf className="size-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Cantidad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton cols={3} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <p className="text-xs text-muted-foreground">
                    {searched
                      ? "No se encontraron resultados."
                      : "Seleccione un rango de fechas y genere el reporte."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{formatDate(row.fecha)}</TableCell>
                  <TableCell>{formatCurrency(Number(row.totalMonto))}</TableCell>
                  <TableCell>{row.cantidadTurnosPagos}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===================================================================
// Turnos Tab
// ===================================================================
function TurnosTab() {
  const { desde, hasta, setDesde, setHasta } = useDateRange();
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [barberoId, setBarberoId] = useState<string>("todos");
  const [data, setData] = useState<ReporteTurno[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function loadBarberos() {
      try {
        const res = await barberosService.getAll();
        setBarberos(res.data);
      } catch {
        // Service may not be ready
      }
    }
    loadBarberos();
  }, []);

  const handleGenerar = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await reportesService.appointments({
        fecha_desde: desde,
        fecha_hasta: hasta,
        barberoId: barberoId !== "todos" ? Number(barberoId) : undefined,
      });
      setData(res.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const { generatePdf } = await import("@/lib/pdf");
    generatePdf({
      title: "Reporte de Turnos",
      subtitle: `Desde ${desde} hasta ${hasta}`,
      columns: ["Barbero", "Total", "Atendidos", "Cancelados"],
      rows: data.map((r) => [r.barberoNombre, r.total, r.atendidos, r.cancelados]),
      filename: "reporte-turnos",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="turnos-desde">Desde</Label>
          <Input
            id="turnos-desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="turnos-hasta">Hasta</Label>
          <Input
            id="turnos-hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Barbero</Label>
          <Select value={barberoId} onValueChange={setBarberoId}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {barberos.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleGenerar} disabled={loading}>
          <MagnifyingGlass className="size-4" />
          {loading ? "Generando..." : "Generar Reporte"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={data.length === 0}>
          <FilePdf className="size-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Barbero</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Atendidos</TableHead>
              <TableHead>Cancelados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton cols={4} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <p className="text-xs text-muted-foreground">
                    {searched
                      ? "No se encontraron resultados."
                      : "Seleccione un rango de fechas y genere el reporte."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.barberoNombre}</TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>{row.atendidos}</TableCell>
                  <TableCell>{row.cancelados}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===================================================================
// Servicios Tab
// ===================================================================
function ServiciosTab() {
  const { desde, hasta, setDesde, setHasta } = useDateRange();
  const [data, setData] = useState<ReporteServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleGenerar = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await reportesService.services({ fecha_desde: desde, fecha_hasta: hasta });
      setData(res.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const { generatePdf } = await import("@/lib/pdf");
    generatePdf({
      title: "Reporte de Servicios",
      subtitle: `Desde ${desde} hasta ${hasta}`,
      columns: ["Servicio", "Cantidad", "Ingresos"],
      rows: data.map((r) => [r.servicioNombre, r.cantidadTurnos, formatCurrency(Number(r.ingresos))]),
      filename: "reporte-servicios",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="servicios-desde">Desde</Label>
          <Input
            id="servicios-desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="servicios-hasta">Hasta</Label>
          <Input
            id="servicios-hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={handleGenerar} disabled={loading}>
          <MagnifyingGlass className="size-4" />
          {loading ? "Generando..." : "Generar Reporte"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={data.length === 0}>
          <FilePdf className="size-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Servicio</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Ingresos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton cols={3} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <p className="text-xs text-muted-foreground">
                    {searched
                      ? "No se encontraron resultados."
                      : "Seleccione un rango de fechas y genere el reporte."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.servicioNombre}</TableCell>
                  <TableCell>{row.cantidadTurnos}</TableCell>
                  <TableCell>{formatCurrency(row.ingresos)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===================================================================
// Reclamos Tab
// ===================================================================
function ReclamosTab() {
  const { desde, hasta, setDesde, setHasta } = useDateRange();
  const [data, setData] = useState<ReporteReclamo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleGenerar = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await reportesService.complaints({ fecha_desde: desde, fecha_hasta: hasta });
      setData((res.data as ReporteReclamo[]) ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const { generatePdf } = await import("@/lib/pdf");
    generatePdf({
      title: "Reporte de Reclamos",
      subtitle: `Desde ${desde} hasta ${hasta}`,
      columns: ["Cliente", "Descripcion", "Fecha", "Estado"],
      rows: data.map((r) => [r.cliente?.nombre ?? "-", r.descripcion, formatDate(r.fecha), r.estado]),
      filename: "reporte-reclamos",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="reclamos-desde">Desde</Label>
          <Input
            id="reclamos-desde"
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="reclamos-hasta">Hasta</Label>
          <Input
            id="reclamos-hasta"
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={handleGenerar} disabled={loading}>
          <MagnifyingGlass className="size-4" />
          {loading ? "Generando..." : "Generar Reporte"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={data.length === 0}>
          <FilePdf className="size-4" />
          Descargar PDF
        </Button>
      </div>

      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton cols={4} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <p className="text-xs text-muted-foreground">
                    {searched
                      ? "No se encontraron resultados."
                      : "Seleccione un rango de fechas y genere el reporte."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.cliente?.nombre ?? "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {row.descripcion}
                  </TableCell>
                  <TableCell>{formatDate(row.fecha)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={row.estado}
                      config={RECLAMO_ESTADOS}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ===================================================================
// Main Page
// ===================================================================
export default function ReportesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Informes y estadisticas del sistema"
      />

      <Card>
        <CardContent>
          <Tabs defaultValue="ingresos">
            <TabsList>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
              <TabsTrigger value="turnos">Turnos</TabsTrigger>
              <TabsTrigger value="servicios">Servicios</TabsTrigger>
              <TabsTrigger value="reclamos">Reclamos</TabsTrigger>
            </TabsList>

            <TabsContent value="ingresos">
              <IngresosTab />
            </TabsContent>

            <TabsContent value="turnos">
              <TurnosTab />
            </TabsContent>

            <TabsContent value="servicios">
              <ServiciosTab />
            </TabsContent>

            <TabsContent value="reclamos">
              <ReclamosTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
