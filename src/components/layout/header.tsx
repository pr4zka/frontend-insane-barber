"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  servicios: "Servicios",
  promociones: "Promociones",
  descuentos: "Descuentos",
  reclamos: "Reclamos",
  presupuestos: "Presupuestos",
  insumos: "Insumos",
  clientes: "Clientes",
  agenda: "Agenda",
  caja: "Caja",
  cobros: "Cobros",
  "libro-ventas": "Libro de Ventas",
  notas: "Notas C/D",
  recaudaciones: "Recaudaciones",
  usuarios: "Usuarios",
  reportes: "Reportes",
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  administrador: "default",
  recepcionista: "secondary",
  barbero: "outline",
};

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const segments = pathname.split("/").filter(Boolean);

  const roleName = user?.rol?.nombre ?? "";
  const badgeVariant = roleBadgeVariant[roleName] ?? "outline";

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="mx-2 !h-4" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const label = routeLabels[segment] ?? segment;
            const isLast = index === segments.length - 1;
            const href = "/" + segments.slice(0, index + 1).join("/");

            return (
              <React.Fragment key={href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {user && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {user.nombre}
          </span>
          <Badge variant={badgeVariant} className="capitalize">
            {roleName}
          </Badge>
        </div>
      )}
    </header>
  );
}
