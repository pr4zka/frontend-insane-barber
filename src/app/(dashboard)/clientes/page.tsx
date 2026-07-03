"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, UserPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { clientesService } from "@/services/clientes.service";
import { formatDate } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
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
  const { user } = useAuth();
  const isBarbero = user?.rol?.nombre === "barbero";
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isBarbero) {
      setLoading(false);
      return;
    }

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
  }, [isBarbero]);

  if (isBarbero) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Clientes"
          description="Registrá y cobrá a un cliente en un solo paso"
        />

        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus className="size-8" weight="duotone" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Atendé a tu próximo cliente</p>
              <p className="text-xs text-muted-foreground">
                Registrá sus datos, el servicio y el cobro en una sola pantalla.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/clientes/rapido">
                <Plus className="size-5" />
                Agregar Cliente
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
