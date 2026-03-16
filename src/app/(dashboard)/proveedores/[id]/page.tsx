"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FloppyDisk } from "@phosphor-icons/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { proveedoresService } from "@/services/compras.service";
import type { Proveedor } from "@/types";

export default function EditarProveedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    ruc: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: true,
  });

  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        const response = await proveedoresService.getById(Number(id));
        const proveedor = response.data;

        if (proveedor) {
          setForm({
            nombre: proveedor.nombre,
            ruc: proveedor.ruc,
            telefono: proveedor.telefono,
            email: proveedor.email,
            direccion: proveedor.direccion,
            estado: proveedor.estado,
          });
        } else {
          router.push("/proveedores");
        }
      } catch (error) {
        console.error("Error al cargar proveedor:", error);
        router.push("/proveedores");
      } finally {
        setLoading(false);
      }
    };

    fetchProveedor();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await proveedoresService.update(Number(id), form);
      toast.success("Proveedor actualizado exitosamente");
      router.push("/proveedores");
    } catch (error) {
      console.error("Error al actualizar proveedor:", error);
      toast.error("Error al actualizar el proveedor");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar Proveedor" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Proveedor"
        description="Modifica los datos del proveedor"
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos del Proveedor</CardTitle>
          <CardDescription>
            Actualiza la informacion del proveedor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre del proveedor"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  name="ruc"
                  placeholder="Ej: 80012345-6"
                  value={form.ruc}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  placeholder="Ej: 0981 123 456"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="proveedor@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="direccion">Direccion</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  placeholder="Direccion del proveedor"
                  value={form.direccion}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="estado"
                checked={form.estado}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    estado: checked === true,
                  }))
                }
              />
              <Label htmlFor="estado">
                {form.estado ? "Activo" : "Inactivo"}
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/proveedores">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                <FloppyDisk className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
