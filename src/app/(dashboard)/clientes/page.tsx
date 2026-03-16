"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { clientesService } from "@/services/clientes.service";
import { formatDate } from "@/lib/constants";
import { toast } from "sonner";
import type { Cliente } from "@/types";

const columns: DataTableColumn<Cliente>[] = [
  {
    key: "nombre",
    header: "Nombre",
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
    key: "fechaRegistro",
    header: "Fecha Registro",
    render: (cliente) => formatDate(cliente.fechaRegistro),
  },
];

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await clientesService.getAll();
        setClientes(response.data);
      } catch (error) {
        toast.error("Error al cargar clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gestiona los clientes de la barberia"
        action={
          <Button asChild size="sm">
            <Link href="/clientes/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={clientes}
        loading={loading}
        emptyMessage="No se encontraron clientes."
        onRowClick={(item) => router.push(`/clientes/${item.id}`)}
      />
    </div>
  );
}
