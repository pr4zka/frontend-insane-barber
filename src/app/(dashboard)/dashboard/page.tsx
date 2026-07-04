"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDots,
  Users,
  CurrencyCircleDollar,
  CashRegister,
  Receipt,
  TrendUp,
  Scales,
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
import { libroComprasService } from "@/services/compras.service";
import { libroVentasService } from "@/services/libro-ventas.service";
import { formatCurrency, todayLocal } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { Turno } from "@/types";
import { BarberoDashboard } from "./barbero-dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const isBarbero = user?.rol?.nombre === "barbero";

  if (isBarbero) return <BarberoDashboard />;

  return <StaffDashboard />;
}

interface DashboardStats {
  turnosHoy: number;
  clientes: number;
  ingresosHoy: number;
  cajaEstado: string;
}

function StaffDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.rol?.nombre === "administrador";

  const [stats, setStats] = useState<DashboardStats>({
    turnosHoy: 0,
    clientes: 0,
    ingresosHoy: 0,
    cajaEstado: "cerrada",
  });
  const [historico, setHistorico] = useState({ gastos: 0, ingresos: 0 });
  const [allTurnos, setAllTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
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

        const hoy = todayLocal();
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

        // Resumen historico (solo administrador: el libro de compras es admin-only)
        if (isAdmin) {
          const [comprasRes, ventasRes] = await Promise.allSettled([
            libroComprasService.getAll(),
            libroVentasService.getAll(),
          ]);
          const compras =
            comprasRes.status === "fulfilled" ? comprasRes.value.data : [];
          const ventas =
            ventasRes.status === "fulfilled" ? ventasRes.value.data : [];

          setHistorico({
            gastos: compras.reduce((sum, c) => sum + Number(c.monto), 0),
            ingresos: ventas.reduce((sum, v) => sum + Number(v.monto), 0),
          });
        }
      } catch {
        toast.error("Error al cargar datos del dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAdmin]);

  const turnosRecientes = useMemo(() => {
    return [...allTurnos]
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      .slice(0, 5);
  }, [allTurnos]);

  const summaryCards = [
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

  const gananciaNeta = historico.ingresos - historico.gastos;
  const historicoCards = [
    {
      title: "Gastos totales",
      value: formatCurrency(historico.gastos),
      icon: Receipt,
      tone: "text-foreground",
    },
    {
      title: "Ingresos totales",
      value: formatCurrency(historico.ingresos),
      icon: TrendUp,
      tone: "text-foreground",
    },
    {
      title: "Ganancia neta",
      value: formatCurrency(gananciaNeta),
      icon: Scales,
      tone: gananciaNeta >= 0 ? "text-emerald-600" : "text-destructive",
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
    {
      key: "barbero",
      header: "Barbero",
      render: (turno) => turno.barbero?.nombre ?? "-",
    },
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
      <PageHeader title="Dashboard" description="Panel principal del sistema" />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Resumen Histórico (solo administrador) */}
      {isAdmin && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Resumen histórico
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {historicoCards.map((card) => (
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
                        <p
                          className={`text-lg font-semibold tracking-tight ${card.tone}`}
                        >
                          {card.value}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rapidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Turnos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<Turno>
            columns={turnoColumns}
            data={turnosRecientes}
            loading={loading}
            emptyMessage="No hay turnos registrados."
          />
        </CardContent>
      </Card>
    </div>
  );
}
