"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDots,
  Users,
  CurrencyCircleDollar,
  CashRegister,
  UserCheck,
  Plus,
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import {
  StatusBadge,
  TURNO_ESTADOS,
} from "@/components/shared/status-badge";
import { turnosService } from "@/services/turnos.service";
import { clientesService } from "@/services/clientes.service";
import { cajaService } from "@/services/caja.service";
import { pagosService } from "@/services/pagos.service";
import { formatCurrency } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Turno } from "@/types";

interface DashboardStats {
  turnosHoy: number;
  clientes: number;
  ingresosHoy: number;
  cajaEstado: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isBarbero = user?.rol?.nombre === "barbero";

  const [stats, setStats] = useState<DashboardStats>({
    turnosHoy: 0,
    clientes: 0,
    ingresosHoy: 0,
    cajaEstado: "cerrada",
  });
  const [allTurnos, setAllTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (isBarbero) {
          // Barbero: solo carga turnos (tiene permiso)
          const turnosRes = await turnosService.getAll();
          const turnos = turnosRes.data ?? [];
          setAllTurnos(turnos);

          const hoy = new Date().toISOString().split("T")[0];
          const misTurnosHoy = turnos.filter(
            (t) => t.fecha.startsWith(hoy) && t.barbero?.usuarioId === user?.id
          );

          setStats({
            turnosHoy: misTurnosHoy.length,
            clientes: 0,
            ingresosHoy: 0,
            cajaEstado: "cerrada",
          });
        } else {
          // Admin/Recepcionista: carga todo
          const [turnosRes, clientesRes, cajaRes, pagosRes] =
            await Promise.allSettled([
              turnosService.getAll(),
              clientesService.getAll(),
              cajaService.getCurrent(),
              pagosService.getAll(),
            ]);

          const turnos =
            turnosRes.status === "fulfilled" ? turnosRes.value.data : [];
          const clientes =
            clientesRes.status === "fulfilled" ? clientesRes.value.data : [];
          const caja =
            cajaRes.status === "fulfilled" ? cajaRes.value.data : null;
          const pagos =
            pagosRes.status === "fulfilled" ? pagosRes.value.data : [];

          setAllTurnos(turnos);

          const hoy = new Date().toISOString().split("T")[0];
          const turnosHoy = turnos.filter((t) => t.fecha.startsWith(hoy));
          const ingresosHoy = pagos
            .filter(
              (p) => p.fecha.startsWith(hoy) && p.estado === "completado"
            )
            .reduce((sum, p) => sum + Number(p.monto), 0);

          setStats({
            turnosHoy: turnosHoy.length,
            clientes: clientes.length,
            ingresosHoy,
            cajaEstado: caja?.estado ?? "cerrada",
          });
        }
      } catch {
        toast.error("Error al cargar datos del dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isBarbero, user?.nombre]);

  // Filtrar turnos para el barbero
  const turnosRecientes = useMemo(() => {
    let filtered = allTurnos;
    if (isBarbero) {
      filtered = allTurnos.filter((t) => t.barbero?.usuarioId === user?.id);
    }
    return [...filtered]
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      .slice(0, 5);
  }, [allTurnos, isBarbero, user?.nombre]);

  // Turnos pendientes del barbero hoy
  const turnosPendientes = useMemo(() => {
    if (!isBarbero) return 0;
    const hoy = new Date().toISOString().split("T")[0];
    return allTurnos.filter(
      (t) =>
        t.barbero?.usuarioId === user?.id &&
        t.fecha.startsWith(hoy) &&
        (t.estado === "pendiente" || t.estado === "confirmado")
    ).length;
  }, [allTurnos, isBarbero, user?.nombre]);

  // Cards según rol
  const summaryCards = isBarbero
    ? [
        {
          title: "Mis turnos hoy",
          value: stats.turnosHoy.toString(),
          icon: CalendarDots,
        },
        {
          title: "Pendientes de atender",
          value: turnosPendientes.toString(),
          icon: UserCheck,
        },
      ]
    : [
        {
          title: "Turnos del dia",
          value: stats.turnosHoy.toString(),
          icon: CalendarDots,
        },
        {
          title: "Clientes",
          value: stats.clientes.toString(),
          icon: Users,
        },
        {
          title: "Ingresos del dia",
          value: formatCurrency(stats.ingresosHoy),
          icon: CurrencyCircleDollar,
        },
        {
          title: "Caja",
          value: stats.cajaEstado === "abierta" ? "Abierta" : "Cerrada",
          icon: CashRegister,
        },
      ];

  const turnoColumns: DataTableColumn<Turno>[] = [
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
    ...(!isBarbero
      ? [
          {
            key: "barbero",
            header: "Barbero",
            render: (turno: Turno) => turno.barbero?.nombre ?? "-",
          },
        ]
      : []),
    {
      key: "hora",
      header: "Hora",
    },
    {
      key: "estado",
      header: "Estado",
      render: (turno) => (
        <StatusBadge status={turno.estado} config={TURNO_ESTADOS} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isBarbero ? `Hola, ${user?.nombre ?? "Barbero"}` : "Dashboard"}
        description={
          isBarbero
            ? "Tu panel de turnos del dia"
            : "Panel principal del sistema"
        }
      />

      {/* Summary Cards */}
      <div className={`grid gap-4 ${isBarbero ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {summaryCards.map((card) => (
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
                    <p className="text-xs text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-lg font-semibold tracking-tight">
                      {card.value}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rapidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {isBarbero ? (
              <>
                {turnosPendientes > 0 ? (
                  <Button asChild size="sm">
                    <Link href="/agenda">
                      <CalendarDots className="size-4" />
                      Ver mis turnos ({turnosPendientes} pendientes)
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link href="/agenda/nuevo">
                      <Plus className="size-4" />
                      Agendar Turno
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button asChild size="sm">
                  <Link href="/agenda">
                    <CalendarDots className="size-4" />
                    Agendar Turno
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/cobros">
                    <CurrencyCircleDollar className="size-4" />
                    Registrar Cobro
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/caja">
                    <CashRegister className="size-4" />
                    Abrir Caja
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>{isBarbero ? "Mis turnos" : "Turnos recientes"}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<Turno>
            columns={turnoColumns}
            data={turnosRecientes}
            loading={loading}
            emptyMessage={
              isBarbero
                ? "No tienes turnos asignados."
                : "No hay turnos registrados."
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
