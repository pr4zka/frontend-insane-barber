"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ordenesCompraService } from "@/services/compras.service";
import { formatCurrency, formatDate } from "@/lib/constants";
import { toast } from "sonner";
import type { OrdenCompra } from "@/types";

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

export default function OrdenesCompraPage() {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdenes = async () => {
    setLoading(true);
    try {
      const res = await ordenesCompraService.getAll();
      setOrdenes(res.data);
    } catch {
      toast.error("Error al cargar órdenes de compra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const columns: DataTableColumn<OrdenCompra>[] = [
    {
      key: "id",
      header: "#",
      render: (orden) => orden.id,
    },
    {
      key: "proveedor",
      header: "Proveedor",
      render: (orden) => orden.proveedor?.nombre ?? "-",
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (orden) => formatDate(orden.fecha),
    },
    {
      key: "total",
      header: "Total",
      render: (orden) => formatCurrency(orden.total),
    },
    {
      key: "estado",
      header: "Estado",
      render: (orden) => (
        <StatusBadge
          status={orden.estado}
          config={ORDEN_COMPRA_ESTADOS}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordenes de Compra"
        description="Gestiona las ordenes de compra a proveedores."
        action={
          <Button size="sm" asChild>
            <Link href="/ordenes-compra/nueva">
              <Plus className="size-4" />
              Nueva Orden
            </Link>
          </Button>
        }
      />

      <DataTable<OrdenCompra>
        columns={columns}
        data={ordenes}
        loading={loading}
        emptyMessage="No se encontraron ordenes de compra."
        onRowClick={(orden) => router.push(`/ordenes-compra/${orden.id}`)}
      />
    </div>
  );
}
