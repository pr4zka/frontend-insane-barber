"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Scissors,
  House,
  Package,
  Tag,
  Percent,
  ChatCircleDots,
  FileText,
  Flask,
  Users,
  CalendarDots,
  CashRegister,
  CreditCard,
  BookOpen,
  Note,
  Bank,
  UserGear,
  ChartBar,
  SignOut,
  Truck,
  ShoppingCart,
  ClipboardText,
  Receipt,
  Notepad,
  Wrench,
  FileArrowUp,
} from "@phosphor-icons/react";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    label: "General",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: House },
    ],
  },
  {
    label: "Modulo 1 - Servicios",
    items: [
      { title: "Servicios", href: "/servicios", icon: Package },
      { title: "Promociones", href: "/promociones", icon: Tag, roles: ["administrador"] },
      { title: "Descuentos", href: "/descuentos", icon: Percent, roles: ["administrador"] },
      { title: "Reclamos", href: "/reclamos", icon: ChatCircleDots, roles: ["administrador", "recepcionista"] },
      { title: "Presupuestos", href: "/presupuestos", icon: FileText, roles: ["administrador", "recepcionista"] },
      { title: "Insumos", href: "/insumos", icon: Flask, roles: ["administrador"] },
    ],
  },
  {
    label: "Modulo 2 - Agenda",
    items: [
      { title: "Clientes", href: "/clientes", icon: Users, roles: ["administrador", "recepcionista"] },
      { title: "Agenda", href: "/agenda", icon: CalendarDots },
    ],
  },
  {
    label: "Modulo 3 - Caja",
    items: [
      { title: "Caja", href: "/caja", icon: CashRegister, roles: ["administrador", "recepcionista"] },
      { title: "Cobros", href: "/cobros", icon: CreditCard, roles: ["administrador", "recepcionista"] },
      { title: "Libro de Ventas", href: "/libro-ventas", icon: BookOpen, roles: ["administrador", "recepcionista"] },
      { title: "Notas C/D", href: "/notas", icon: Note, roles: ["administrador"] },
      { title: "Recaudaciones", href: "/recaudaciones", icon: Bank, roles: ["administrador"] },
      { title: "Notas Remision", href: "/notas-remision-venta", icon: FileArrowUp, roles: ["administrador", "recepcionista"] },
    ],
  },
  {
    label: "Modulo 4 - Compras",
    items: [
      { title: "Proveedores", href: "/proveedores", icon: Truck, roles: ["administrador"] },
      { title: "Ordenes de Compra", href: "/ordenes-compra", icon: ShoppingCart, roles: ["administrador"] },
      { title: "Libro de Compras", href: "/libro-compras", icon: ClipboardText, roles: ["administrador"] },
      { title: "Notas de Remision", href: "/notas-remision", icon: Receipt, roles: ["administrador"] },
      { title: "Notas C/D Compras", href: "/notas-cd-compra", icon: Notepad, roles: ["administrador"] },
      { title: "Ajustes", href: "/ajustes-compra", icon: Wrench, roles: ["administrador"] },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Usuarios", href: "/usuarios", icon: UserGear, roles: ["administrador"] },
      { title: "Reportes", href: "/reportes", icon: ChartBar, roles: ["administrador", "recepcionista"] },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Scissors className="size-4" weight="bold" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">Insane Barber</span>
                  <span className="truncate text-xs text-sidebar-foreground/50">
                    Sistema de gestion
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {navGroups
          .map((group) => ({
            ...group,
            items: group.items.filter(
              (item) => !item.roles || (user?.rol?.nombre && item.roles.includes(user.rol.nombre))
            ),
          }))
          .filter((group) => group.items.length > 0)
          .map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="uppercase tracking-[0.1em] text-sidebar-foreground/50">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href}>
                          <item.icon weight={isActive ? "fill" : "regular"} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold uppercase">
                {user?.nombre?.charAt(0) ?? "U"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-xs font-medium">
                  {user?.nombre ?? "Usuario"}
                </span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {user?.rol?.nombre ?? "Sin rol"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleLogout}
                title="Cerrar sesion"
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <SignOut className="size-3.5" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
