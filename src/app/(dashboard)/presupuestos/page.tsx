"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import {
  StatusBadge,
  PRESUPUESTO_ESTADOS,
} from "@/components/shared/status-badge";
import { presupuestosService } from "@/services/presupuestos.service";
import { formatCurrency, formatDate } from "@/lib/constants";
import { toast } from "sonner";
import type { Presupuesto } from "@/types";

export default function PresupuestosPage() {
  const router = useRouter();
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPresupuestos = async () => {
    setLoading(true);
    try {
      const res = await presupuestosService.getAll();
      setPresupuestos(res.data);
    } catch {
      toast.error("Error al cargar presupuestos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresupuestos();
  }, []);

  const columns: DataTableColumn<Presupuesto>[] = [
    {
      key: "cliente",
      header: "Cliente",
      render: (presupuesto) => presupuesto.cliente?.nombre ?? "-",
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (presupuesto) => formatDate(presupuesto.fecha),
    },
    {
      key: "total",
      header: "Total",
      render: (presupuesto) => formatCurrency(presupuesto.total),
    },
    {
      key: "estado",
      header: "Estado",
      render: (presupuesto) => (
        <StatusBadge
          status={presupuesto.estado}
          config={PRESUPUESTO_ESTADOS}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presupuestos"
        description="Gestiona los presupuestos para los clientes."
        action={
          <Button size="sm" asChild>
            <Link href="/presupuestos/nuevo">
              <Plus className="size-4" />
              Nuevo Presupuesto
            </Link>
          </Button>
        }
      />

      <DataTable<Presupuesto>
        columns={columns}
        data={presupuestos}
        loading={loading}
        emptyMessage="No se encontraron presupuestos."
        onRowClick={(presupuesto) =>
          router.push(`/presupuestos/${presupuesto.id}`)
        }
      />
    </div>
  );
}
