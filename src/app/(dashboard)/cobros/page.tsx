"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FilePdf } from "@phosphor-icons/react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, PAGO_ESTADOS } from "@/components/shared/status-badge";
import { pagosService } from "@/services/pagos.service";
import { formatCurrency, formatDateTime, METODOS_PAGO } from "@/lib/constants";
import type { Pago, MetodoPago } from "@/types";

export default function CobrosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPagos() {
      setLoading(true);
      try {
        const res = await pagosService.getAll();
        setPagos(res.data);
      } catch {
        setPagos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPagos();
  }, []);

  function handleReceipt(pago: Pago) {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Insane Barber", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Comprobante de Pago", 105, 28, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let y = 45;
    doc.text(`Comprobante #: ${pago.id}`, 20, y); y += 8;
    doc.text(`Fecha: ${formatDateTime(pago.fecha)}`, 20, y); y += 8;
    doc.text(`Cliente: ${pago.turno?.cliente?.nombre ?? "-"}`, 20, y); y += 8;
    doc.text(`Servicio: ${pago.turno?.servicio?.nombre ?? "-"}`, 20, y); y += 8;
    doc.text(`Metodo de Pago: ${pago.metodoPago}`, 20, y); y += 8;
    doc.setFont("helvetica", "bold");
    doc.text(`Monto: ${formatCurrency(pago.monto)}`, 20, y); y += 8;
    doc.setFont("helvetica", "normal");
    doc.text(`Estado: ${pago.estado}`, 20, y);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Gracias por su preferencia", 105, 120, { align: "center" });
    doc.save(`comprobante-${pago.id}.pdf`);
  }

  const columns: DataTableColumn<Pago>[] = [
    {
      key: "turno",
      header: "Turno",
      render: (pago) => {
        const clienteNombre = pago.turno?.cliente?.nombre ?? "Sin cliente";
        const servicioNombre = pago.turno?.servicio?.nombre ?? "Sin servicio";
        return (
          <div className="flex flex-col">
            <span className="text-xs font-medium">{clienteNombre}</span>
            <span className="text-xs text-muted-foreground">
              {servicioNombre}
            </span>
          </div>
        );
      },
    },
    {
      key: "metodoPago",
      header: "Metodo",
      render: (pago) =>
        METODOS_PAGO[pago.metodoPago as MetodoPago] ?? pago.metodoPago,
    },
    {
      key: "monto",
      header: "Monto",
      render: (pago) => (
        <span className="font-medium">{formatCurrency(pago.monto)}</span>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      render: (pago) => (
        <StatusBadge status={pago.estado} config={PAGO_ESTADOS} />
      ),
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (pago) => formatDateTime(pago.fecha),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (pago) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleReceipt(pago); }}>
          <FilePdf className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cobros"
        description="Listado de todos los pagos registrados"
        action={
          <Button asChild size="sm">
            <Link href="/cobros/nuevo">
              <Plus className="size-4" />
              Nuevo Cobro
            </Link>
          </Button>
        }
      />

      <DataTable<Pago>
        columns={columns}
        data={pagos}
        loading={loading}
        emptyMessage="No se encontraron cobros registrados."
      />
    </div>
  );
}
