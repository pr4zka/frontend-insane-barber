"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FloppyDisk } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { clientesService } from "@/services/clientes.service";
import type { Cliente } from "@/types";

export default function EditarClientePage({
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
    telefono: "",
    email: "",
  });

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await clientesService.getAll();
        const cliente = response.data.find(
          (c: Cliente) => c.id === Number(id)
        );

        if (cliente) {
          setForm({
            nombre: cliente.nombre,
            telefono: cliente.telefono,
            email: cliente.email,
          });
        } else {
          router.push("/clientes");
        }
      } catch (error) {
        console.error("Error al cargar cliente:", error);
        router.push("/clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await clientesService.update(Number(id), form);
      router.push("/clientes");
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar Cliente" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
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
        title="Editar Cliente"
        description="Modifica los datos del cliente"
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos del Cliente</CardTitle>
          <CardDescription>
            Actualiza la informacion del cliente.
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
                  placeholder="Nombre completo"
                  value={form.nombre}
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

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/clientes">Cancelar</Link>
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
