"use client";

import { useState, useEffect, useCallback } from "react";
import { FunnelSimple, FilePdf, PencilSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { libroComprasService } from "@/services/compras.service";
import {
  formatDate,
  formatCurrency,
  CATEGORIAS_COMPRA,
  TIPOS_COMPROBANTE,
  CONDICIONES_COMPRA,
  TASAS_IVA,
  tipoComprobanteLabel,
} from "@/lib/constants";

import { toast } from "sonner";
import type { LibroCompras } from "@/types";

export default function LibroComprasPage() {
  const [entries, setEntries] = useState<LibroCompras[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LibroCompras[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Edición
  const [editing, setEditing] = useState<LibroCompras | null>(null);
  const [editCategoria, setEditCategoria] = useState("");
  const [editDetalle, setEditDetalle] = useState("");
  const [editTipoComprobante, setEditTipoComprobante] = useState("factura");
  const [editNroComprobante, setEditNroComprobante] = useState("");
  const [editTimbrado, setEditTimbrado] = useState("");
  const [editCondicion, setEditCondicion] = useState("contado");
  const [editRuc, setEditRuc] = useState("");
  const [editTasaIva, setEditTasaIva] = useState("10");
  const [saving, setSaving] = useState(false);

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

    const sum = (key: keyof LibroCompras) =>
      filteredEntries.reduce((s, e) => s + Number(e[key] ?? 0), 0);

    generatePdf({
      title: "Libro de Compras",
      subtitle,
      orientation: "landscape",
      columns: [
        "Fecha",
        "Comprobante",
        "RUC",
        "Concepto",
        "Grav. 10%",
        "IVA 10%",
        "Grav. 5%",
        "IVA 5%",
        "Exento",
        "Total",
      ],
      rows: filteredEntries.map((e) => [
        formatDate(e.fecha),
        `${tipoComprobanteLabel(e.tipoComprobante)} ${e.nroComprobante}`.trim(),
        e.rucProveedor || "-",
        e.concepto,
        formatCurrency(e.gravado10),
        formatCurrency(e.iva10),
        formatCurrency(e.gravado5),
        formatCurrency(e.iva5),
        formatCurrency(e.exento),
        formatCurrency(e.monto),
      ]),
      totals: [
        { label: "Gravado 10%", value: formatCurrency(sum("gravado10")) },
        { label: "IVA 10%", value: formatCurrency(sum("iva10")) },
        { label: "Gravado 5%", value: formatCurrency(sum("gravado5")) },
        { label: "IVA 5%", value: formatCurrency(sum("iva5")) },
        { label: "Exento", value: formatCurrency(sum("exento")) },
        { label: "Total", value: formatCurrency(totalSum) },
      ],
      filename: "libro-compras",
    });
  };

  const openEdit = (entry: LibroCompras) => {
    setEditing(entry);
    setEditCategoria(entry.categoria || "otros");
    setEditDetalle(entry.detalle || "");
    setEditTipoComprobante(entry.tipoComprobante || "factura");
    setEditNroComprobante(entry.nroComprobante || "");
    setEditTimbrado(entry.timbrado || "");
    setEditCondicion(entry.condicion || "contado");
    setEditRuc(entry.rucProveedor || "");
    setEditTasaIva(String(entry.tasaIva ?? 10));
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await libroComprasService.update(editing.id, {
        categoria: editCategoria,
        detalle: editDetalle.trim(),
        tipoComprobante: editTipoComprobante,
        nroComprobante: editNroComprobante.trim(),
        timbrado: editTimbrado.trim(),
        condicion: editCondicion,
        rucProveedor: editRuc.trim(),
        tasaIva: Number(editTasaIva),
      });
      const updated = res.data;
      setEntries((prev) =>
        prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
      );
      setFilteredEntries((prev) =>
        prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
      );
      toast.success("Registro actualizado correctamente.");
      setEditing(null);
    } catch {
      toast.error("Error al actualizar el registro.");
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<LibroCompras>[] = [
    {
      key: "fecha",
      header: "Fecha",
      render: (entry) => formatDate(entry.fecha),
    },
    {
      key: "comprobante",
      header: "Comprobante",
      render: (entry) => (
        <span className="whitespace-nowrap">
          {tipoComprobanteLabel(entry.tipoComprobante)}
          {entry.nroComprobante ? (
            <span className="text-muted-foreground"> · {entry.nroComprobante}</span>
          ) : null}
        </span>
      ),
    },
    {
      key: "concepto",
      header: "Concepto",
    },
    {
      key: "detalle",
      header: "Detalle",
      render: (entry) => (
        <span className="text-muted-foreground">{entry.detalle || "—"}</span>
      ),
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
    {
      key: "acciones",
      header: "",
      render: (entry) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openEdit(entry)}
          aria-label="Editar categoría"
        >
          <PencilSimple className="size-4" />
        </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar registro</DialogTitle>
            <DialogDescription>
              {editing
                ? `${editing.proveedor} — ${formatCurrency(editing.monto)}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={editCategoria} onValueChange={setEditCategoria}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIAS_COMPRA).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDetalle">Detalle (opcional)</Label>
              <Input
                id="editDetalle"
                placeholder="Ej: shampoo, ceras y geles"
                value={editDetalle}
                onChange={(e) => setEditDetalle(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de comprobante</Label>
                <Select
                  value={editTipoComprobante}
                  onValueChange={setEditTipoComprobante}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPOS_COMPROBANTE).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editNro">N° comprobante</Label>
                <Input
                  id="editNro"
                  placeholder="001-001-0001234"
                  value={editNroComprobante}
                  onChange={(e) => setEditNroComprobante(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editTimbrado">Timbrado</Label>
                <Input
                  id="editTimbrado"
                  placeholder="12345678"
                  value={editTimbrado}
                  onChange={(e) => setEditTimbrado(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRuc">RUC proveedor</Label>
                <Input
                  id="editRuc"
                  placeholder="80012345-6"
                  value={editRuc}
                  onChange={(e) => setEditRuc(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Condición</Label>
                <Select value={editCondicion} onValueChange={setEditCondicion}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONDICIONES_COMPRA).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>IVA</Label>
                <Select value={editTasaIva} onValueChange={setEditTasaIva}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASAS_IVA.map((t) => (
                      <SelectItem key={t.value} value={String(t.value)}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
