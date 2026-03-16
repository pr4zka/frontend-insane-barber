"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { notasRemisionService } from "@/services/compras.service";
import { formatDate } from "@/lib/constants";
import type { NotaRemision } from "@/types";

export default function NotasRemisionPage() {
  const [notas, setNotas] = useState<NotaRemision[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notasRemisionService.getAll();
      setNotas(res.data);
    } catch {
      setNotas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]);

  const columns: DataTableColumn<NotaRemision>[] = [
    {
      key: "id",
      header: "#",
      render: (nota) => (
        <span className="font-mono text-xs">#{nota.id}</span>
      ),
    },
    {
      key: "ordenCompraId",
      header: "Orden",
      render: (nota) => (
        <span className="font-mono text-xs">OC #{nota.ordenCompraId}</span>
      ),
    },
    {
      key: "proveedor",
      header: "Proveedor",
      render: (nota) => nota.ordenCompra?.proveedor?.nombre ?? "-",
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (nota) => formatDate(nota.fecha),
    },
    {
      key: "observacion",
      header: "Observacion",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas de Remision"
        description="Documentos de recepcion de mercaderia"
      />

      <DataTable<NotaRemision>
        columns={columns}
        data={notas}
        loading={loading}
        emptyMessage="No se encontraron notas de remision."
      />
    </div>
  );
}
