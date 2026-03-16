"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, ESTADO_ACTIVO } from "@/components/shared/status-badge";
import { proveedoresService } from "@/services/compras.service";
import { toast } from "sonner";
import type { Proveedor } from "@/types";

const columns: DataTableColumn<Proveedor>[] = [
  {
    key: "nombre",
    header: "Nombre",
  },
  {
    key: "ruc",
    header: "RUC",
  },
  {
    key: "telefono",
    header: "Telefono",
  },
  {
    key: "email",
    header: "Email",
  },
  {
    key: "estado",
    header: "Estado",
    render: (proveedor) => (
      <StatusBadge
        status={String(proveedor.estado)}
        config={ESTADO_ACTIVO}
      />
    ),
  },
];

export default function ProveedoresPage() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const response = await proveedoresService.getAll();
        setProveedores(response.data);
      } catch {
        toast.error("Error al cargar proveedores");
      } finally {
        setLoading(false);
      }
    };

    fetchProveedores();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proveedores"
        description="Gestiona los proveedores de la barberia"
        action={
          <Button asChild size="sm">
            <Link href="/proveedores/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proveedor
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={proveedores}
        loading={loading}
        emptyMessage="No se encontraron proveedores."
        onRowClick={(item) => router.push(`/proveedores/${item.id}`)}
      />
    </div>
  );
}
