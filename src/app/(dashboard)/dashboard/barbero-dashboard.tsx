"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDots, Plus, UserCheck, UserPlus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge, TURNO_ESTADOS } from "@/components/shared/status-badge";
import { AtenderClienteDialog } from "@/components/barbero/atender-cliente-dialog";
import { turnosService } from "@/services/turnos.service";
import { serviciosService } from "@/services/servicios.service";
import { formatCurrency } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Turno, Servicio } from "@/types";

export function BarberoDashboard() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => setRefreshKey((k) => k + 1);
  const handleAtenderCliente = () => setDialogOpen(true);

  return (
    <div className="space-y-6">
      <PageHeader title={`Hola, ${user?.nombre ?? "Barbero"}`} description="Tu panel de turnos del dia" />

      <Tabs defaultValue="inicio">
        <TabsList>
          <TabsTrigger value="inicio">Inicio</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
        </TabsList>
        <TabsContent value="inicio">
          <InicioTab key={`inicio-${refreshKey}`} onAtenderCliente={handleAtenderCliente} />
        </TabsContent>
        <TabsContent value="agenda">
          <AgendaTab key={`agenda-${refreshKey}`} onAtenderCliente={handleAtenderCliente} />
        </TabsContent>
        <TabsContent value="servicios">
          <ServiciosTab />
        </TabsContent>
      </Tabs>

      <AtenderClienteDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={handleSuccess} />
    </div>
  );
}

function InicioTab({ onAtenderCliente }: { onAtenderCliente: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [turnosHoy, setTurnosHoy] = useState(0);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await turnosService.getAll();
        const turnos = res.data ?? [];
        const hoy = new Date().toISOString().split("T")[0];
        const misTurnos = turnos.filter((t) => t.barbero?.usuarioId === user?.id);
        setTurnosHoy(misTurnos.filter((t) => t.fecha.startsWith(hoy)).length);
        setPendientes(
          misTurnos.filter(
            (t) => t.fecha.startsWith(hoy) && (t.estado === "pendiente" || t.estado === "confirmado")
          ).length
        );
      } catch {
        toast.error("Error al cargar el dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  const cards = [
    { title: "Mis turnos hoy", value: turnosHoy.toString(), icon: CalendarDots },
    { title: "Pendientes de atender", value: pendientes.toString(), icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="flex items-center gap-4">
              {loading ? (
                <>
                  <Skeleton className="size-10" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    <card.icon className="size-5" weight="duotone" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{card.title}</p>
                    <p className="text-lg font-semibold tracking-tight">{card.value}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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
          <Button size="lg" className="w-full sm:w-auto" onClick={onAtenderCliente}>
            <Plus className="size-5" />
            Atender Cliente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AgendaTab({ onAtenderCliente }: { onAtenderCliente: () => void }) {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await turnosService.getAll();
      setTurnos(res.data ?? []);
    } catch {
      toast.error("Error al cargar la agenda");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTurnos = useMemo(
    () => turnos.filter((t) => t.fecha.startsWith(fecha) && t.barbero?.usuarioId === user?.id),
    [turnos, fecha, user?.id]
  );

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

  const columns: DataTableColumn<Turno>[] = [
    { key: "hora", header: "Hora" },
    { key: "cliente", header: "Cliente", render: (t) => t.cliente?.nombre ?? "-" },
    { key: "servicio", header: "Servicio", render: (t) => t.servicio?.nombre ?? "-" },
    {
      key: "estado",
      header: "Estado",
      render: (t) => <StatusBadge status={t.estado} config={TURNO_ESTADOS} />,
    },
    {
      key: "acciones",
      header: "Acciones",
      render: (t) =>
        t.estado === "confirmado" ? (
          <Button
            size="sm"
            variant="outline"
            disabled={actionLoading === t.id}
            onClick={(e) => {
              e.stopPropagation();
              handleAtendido(t.id);
            }}
          >
            <UserCheck className="mr-1 h-3.5 w-3.5" />
            {actionLoading === t.id ? "..." : "Atendido"}
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label htmlFor="fecha-agenda">Fecha</Label>
          <Input
            id="fecha-agenda"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full sm:w-[180px]"
          />
        </div>
        <Button className="w-full sm:w-auto" onClick={onAtenderCliente}>
          <Plus className="size-4" />
          Atender Cliente
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredTurnos}
        loading={loading}
        emptyMessage="No hay turnos para la fecha seleccionada."
      />
    </div>
  );
}

function ServiciosTab() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await serviciosService.getAll();
        setServicios(res.data.filter((s) => s.estado));
      } catch {
        toast.error("Error al cargar los servicios");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const columns: DataTableColumn<Servicio>[] = [
    { key: "nombre", header: "Nombre" },
    { key: "precio", header: "Precio", render: (s) => formatCurrency(Number(s.precio)) },
    { key: "duracionMin", header: "Duración", render: (s) => `${s.duracionMin} min` },
  ];

  return (
    <DataTable
      columns={columns}
      data={servicios}
      loading={loading}
      emptyMessage="No hay servicios activos."
    />
  );
}
