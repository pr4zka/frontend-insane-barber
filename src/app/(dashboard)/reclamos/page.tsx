"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { StatusBadge, RECLAMO_ESTADOS } from "@/components/shared/status-badge";
import { reclamosService } from "@/services/reclamos.service";
import { clientesService } from "@/services/clientes.service";
import { formatDate } from "@/lib/constants";
import { toast } from "sonner";
import type { Reclamo, Cliente } from "@/types";

interface FormData {
  clienteId: string;
  descripcion: string;
}

const INITIAL_FORM: FormData = {
  clienteId: "",
  descripcion: "",
};

export default function ReclamosPage() {
  const router = useRouter();
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchReclamos = async () => {
    setLoading(true);
    try {
      const res = await reclamosService.getAll();
      setReclamos(res.data);
    } catch {
      toast.error("Error al cargar reclamos");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const res = await clientesService.getAll();
      setClientes(res.data);
    } catch {
      toast.error("Error al cargar clientes");
    }
  };

  useEffect(() => {
    fetchReclamos();
  }, []);

  const handleOpenDialog = () => {
    setFormData(INITIAL_FORM);
    setError("");
    setDialogOpen(true);
    fetchClientes();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.clienteId) {
      setError("Seleccione un cliente.");
      return;
    }
    if (!formData.descripcion.trim()) {
      setError("La descripcion es requerida.");
      return;
    }

    setSubmitting(true);
    try {
      await reclamosService.create({
        clienteId: Number(formData.clienteId),
        descripcion: formData.descripcion.trim(),
      });
      setDialogOpen(false);
      fetchReclamos();
    } catch {
      setError("Error al crear el reclamo. Intente nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: DataTableColumn<Reclamo>[] = [
    {
      key: "cliente",
      header: "Cliente",
      render: (reclamo) => reclamo.cliente?.nombre ?? "-",
    },
    {
      key: "descripcion",
      header: "Descripcion",
    },
    {
      key: "fecha",
      header: "Fecha",
      render: (reclamo) => formatDate(reclamo.fecha),
    },
    {
      key: "estado",
      header: "Estado",
      render: (reclamo) => (
        <StatusBadge
          status={reclamo.estado}
          config={RECLAMO_ESTADOS}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reclamos"
        description="Gestiona los reclamos de los clientes."
        action={
          <Button size="sm" onClick={handleOpenDialog}>
            <Plus className="size-4" />
            Nuevo Reclamo
          </Button>
        }
      />

      <DataTable<Reclamo>
        columns={columns}
        data={reclamos}
        loading={loading}
        emptyMessage="No se encontraron reclamos."
        onRowClick={(reclamo) => router.push(`/reclamos/${reclamo.id}`)}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Reclamo</DialogTitle>
            <DialogDescription>
              Registre un nuevo reclamo de un cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, clienteId: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={String(cliente.id)}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripcion</Label>
              <Textarea
                id="descripcion"
                placeholder="Describa el reclamo del cliente"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                rows={4}
                required
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
