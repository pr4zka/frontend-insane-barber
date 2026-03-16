"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  CheckCircle,
  XCircle,
  UserCheck,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, TURNO_ESTADOS } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { turnosService } from "@/services/turnos.service";
import { barberosService } from "@/services/barberos.service";
import { useAuth } from "@/hooks/use-auth";
import type { Turno, Barbero } from "@/types";

export default function AgendaPage() {
  const { user } = useAuth();
  const isBarbero = user?.rol?.nombre === "barbero";
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [barberoFilter, setBarberoFilter] = useState("todos");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [turnoToCancel, setTurnoToCancel] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [turnosRes, barberosRes] = await Promise.allSettled([
        turnosService.getAll(),
        barberosService.getAll(),
      ]);
      if (turnosRes.status === "fulfilled") setTurnos(turnosRes.value.data);
      if (barberosRes.status === "fulfilled") setBarberos(barberosRes.value.data);
    } catch {
      toast.error("Error al cargar la agenda");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTurnos = useMemo(() => turnos.filter((turno) => {
    const matchesFecha = turno.fecha.startsWith(fecha);
    const matchesBarbero =
      barberoFilter === "todos" || turno.barberoId === Number(barberoFilter);
    // El barbero solo ve los turnos asignados a el (por usuarioId)
    const matchesUser = !isBarbero || turno.barbero?.usuarioId === user?.id;
    return matchesFecha && matchesBarbero && matchesUser;
  }), [turnos, fecha, barberoFilter, isBarbero, user?.id]);

  const handleConfirm = async (id: number) => {
    if (actionLoading) return;
    setActionLoading(id);
    try {
      await turnosService.confirm(id);
      toast.success("Turno confirmado");
      await fetchData();
    } catch {
      toast.error("Error al confirmar turno");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (turnoToCancel === null) return;
    setActionLoading(turnoToCancel);
    try {
      await turnosService.cancel(turnoToCancel);
      toast.success("Turno cancelado");
      setCancelDialogOpen(false);
      setTurnoToCancel(null);
      await fetchData();
    } catch {
      toast.error("Error al cancelar turno");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAtendido = async (id: number) => {
    if (actionLoading) return;
    setActionLoading(id);
    try {
      await turnosService.update(id, { estado: "atendido" });
      toast.success("Turno marcado como atendido");
      await fetchData();
    } catch {
      toast.error("Error al marcar turno como atendido");
    } finally {
      setActionLoading(null);
    }
  };

  const openCancelDialog = (id: number) => {
    setTurnoToCancel(id);
    setCancelDialogOpen(true);
  };

  const columns: DataTableColumn<Turno>[] = [
    {
      key: "hora",
      header: "Hora",
    },
    {
      key: "cliente",
      header: "Cliente",
      render: (turno) => turno.cliente?.nombre ?? "-",
    },
    {
      key: "servicio",
      header: "Servicio",
      render: (turno) => turno.servicio?.nombre ?? "-",
    },
    {
      key: "barbero",
      header: "Barbero",
      render: (turno) => turno.barbero?.nombre ?? "-",
    },
    {
      key: "estado",
      header: "Estado",
      render: (turno) => (
        <StatusBadge status={turno.estado} config={TURNO_ESTADOS} />
      ),
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (turno) => (
        <div className="flex items-center gap-1">
          {!isBarbero && turno.estado === "pendiente" && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading === turno.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirm(turno.id);
                }}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" />
                {actionLoading === turno.id ? "..." : "Confirmar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!!actionLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  openCancelDialog(turno.id);
                }}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" />
                Cancelar
              </Button>
            </>
          )}
          {turno.estado === "confirmado" && (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading === turno.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAtendido(turno.id);
                }}
              >
                <UserCheck className="mr-1 h-3.5 w-3.5" />
                {actionLoading === turno.id ? "..." : "Atendido"}
              </Button>
              {!isBarbero && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!actionLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    openCancelDialog(turno.id);
                  }}
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" />
                  Cancelar
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description={isBarbero ? "Tus turnos asignados" : "Gestiona los turnos de la barberia"}
        action={
          !isBarbero ? (
            <Button asChild size="sm">
              <Link href="/agenda/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Turno
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-[180px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Barbero</Label>
          <Select value={barberoFilter} onValueChange={setBarberoFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por barbero" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {barberos.map((barbero) => (
                <SelectItem key={barbero.id} value={String(barbero.id)}>
                  {barbero.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTurnos}
        loading={loading}
        emptyMessage="No hay turnos para la fecha seleccionada."
      />

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="Cancelar Turno"
        description="Esta seguro que desea cancelar este turno? Esta accion no se puede deshacer."
        onConfirm={handleCancel}
        confirmText="Cancelar Turno"
        destructive
      />
    </div>
  );
}
