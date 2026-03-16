"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, ESTADO_ACTIVO } from "@/components/shared/status-badge";
import { serviciosService } from "@/services/servicios.service";
import { formatCurrency } from "@/lib/constants";
import { toast } from "sonner";
import type { Servicio } from "@/types";

export default function ServiciosPage() {
  const router = useRouter();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServicios = async () => {
    setLoading(true);
    try {
      const res = await serviciosService.getAll();
      setServicios(res.data);
    } catch {
      toast.error("Error al cargar servicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const columns: DataTableColumn<Servicio>[] = [
    {
      key: "nombre",
      header: "Nombre",
    },
    {
      key: "descripcion",
      header: "Descripcion",
    },
    {
      key: "precio",
      header: "Precio",
      render: (servicio) => formatCurrency(servicio.precio),
    },
    {
      key: "duracionMin",
      header: "Duracion (min)",
      render: (servicio) => `${servicio.duracionMin} min`,
    },
    {
      key: "estado",
      header: "Estado",
      render: (servicio) => (
        <StatusBadge
          status={String(servicio.estado)}
          config={ESTADO_ACTIVO}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servicios"
        description="Gestiona los servicios disponibles en la barberia."
        action={
          <Button size="sm" asChild>
            <Link href="/servicios/nuevo">
              <Plus className="size-4" />
              Nuevo Servicio
            </Link>
          </Button>
        }
      />

      <DataTable<Servicio>
        columns={columns}
        data={servicios}
        loading={loading}
        emptyMessage="No se encontraron servicios."
        onRowClick={(servicio) => router.push(`/servicios/${servicio.id}`)}
      />
    </div>
  );
}
